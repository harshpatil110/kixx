const { db } = require('../db/index');
const { users, products, brands, pastOrders, inventoryLogs } = require('../db/schema');
const { sql, eq, asc, desc, count } = require('drizzle-orm');

/**
 * GET /api/admin/stats
 * Aggregates KPI dashboard data: total revenue, order count, customer count.
 * All calculations happen at the PostgreSQL level for maximum efficiency.
 */
const getDashboardStats = async (req, res) => {
    try {
        // Query 1: Total Revenue  (SUM of past_orders.total_amount)
        const [revenueResult] = await db
            .select({ total: sql`COALESCE(SUM(${pastOrders.totalAmount}), 0)` })
            .from(pastOrders);

        // Query 2: Total Order Count
        const [ordersResult] = await db
            .select({ count: count() })
            .from(pastOrders);

        // Query 3: Total Customers (users where role = 'customer')
        const [customersResult] = await db
            .select({ count: count() })
            .from(users)
            .where(eq(users.role, 'customer'));

        return res.status(200).json({
            success: true,
            revenue: parseInt(revenueResult.total, 10),
            totalOrders: parseInt(ordersResult.count, 10),
            totalCustomers: parseInt(customersResult.count, 10),
        });
    } catch (error) {
        console.error('[Admin] ❌ Stats Endpoint Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats.' });
    }
};

/**
 * GET /api/admin/sales-by-brand
 * Aggregates total revenue per brand by unnesting the JSONB `items` array
 * inside `past_orders`, joining each item's `id` back to `products` → `brands`.
 *
 * Strategy:
 *   1. Use jsonb_array_elements to unnest past_orders.items into individual rows.
 *   2. Cast each element's `id` (text UUID) back to a uuid to join products.
 *   3. Join products → brands to get the brand name.
 *   4. Aggregate: SUM(element->>'price' * element->>'quantity') grouped by brand.
 */
const getSalesByBrand = async (req, res) => {
    try {
        const result = await db.execute(sql`
            SELECT
                b.name                                                       AS brand,
                COALESCE(SUM(
                    (elem->>'price')::numeric * (elem->>'quantity')::numeric
                ), 0)::integer                                               AS sales
            FROM past_orders po,
                 jsonb_array_elements(po.items) AS elem
            JOIN products p  ON p.id = (elem->>'id')::uuid
            JOIN brands  b  ON b.id = p.brand_id
            GROUP BY b.name
            ORDER BY sales DESC
        `);

        return res.status(200).json({ success: true, data: result.rows ?? result });
    } catch (error) {
        console.error('[Admin] ❌ Sales-by-Brand Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch sales by brand.' });
    }
};

/**
 * GET /api/admin/inventory-alerts
 * Returns the 10 products with the lowest stock for the admin dashboard's
 * "Low Stock Alerts" widget.
 */
const getLowStockAlerts = async (req, res) => {
    try {
        const lowStockProducts = await db
            .select({
                id: products.id,
                name: products.name,
                stock: products.stock,
                category: products.category,
                imageUrl: products.imageUrl,
                basePrice: products.basePrice,
            })
            .from(products)
            .orderBy(asc(products.stock))
            .limit(10);

        return res.status(200).json({ success: true, data: lowStockProducts });
    } catch (error) {
        console.error('[Admin] ❌ Inventory Alerts Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch inventory alerts.' });
    }
};

/**
 * GET /api/admin/inventory
 * Fetches ALL products (joined with brand name) for the full inventory table.
 */
const getInventory = async (req, res) => {
    try {
        const rows = await db
            .select({
                id: products.id,
                name: products.name,
                category: products.category,
                basePrice: products.basePrice,
                stock: products.stock,
                imageUrl: products.imageUrl,
                brandName: brands.name,
                isNew: products.isNew,
                isOnSale: products.isOnSale,
            })
            .from(products)
            .leftJoin(brands, eq(products.brandId, brands.id))
            .orderBy(asc(products.name));

        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('[Admin] ❌ Get Inventory Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch inventory.' });
    }
};

/**
 * PUT /api/admin/inventory/:id
 * Updates the stock integer for a single product and writes an audit log.
 * Body: { stock: number }
 */
const updateInventory = async (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock === null || isNaN(parseInt(stock, 10))) {
        return res.status(400).json({ success: false, message: 'Invalid stock value. Must be a number.' });
    }

    const newStock = parseInt(stock, 10);
    if (newStock < 0) {
        return res.status(400).json({ success: false, message: 'Stock cannot be negative.' });
    }

    try {
        // 1. Fetch current stock for the audit delta
        const [current] = await db
            .select({ stock: products.stock, name: products.name })
            .from(products)
            .where(eq(products.id, id))
            .limit(1);

        if (!current) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        const delta = newStock - (parseInt(current.stock, 10) || 0);

        // 2. Update the stock column in-place
        const [updated] = await db
            .update(products)
            .set({ stock: newStock, updatedAt: new Date() })
            .where(eq(products.id, id))
            .returning({
                id: products.id,
                name: products.name,
                stock: products.stock,
            });

        // 3. Write audit log (non-fatal — don't fail the request if this errors)
        try {
            await db.insert(inventoryLogs).values({
                productId: id,
                changeType: delta >= 0 ? 'manual_restock' : 'manual_reduction',
                quantityChanged: delta,
            });
        } catch (logErr) {
            console.warn('[Admin] ⚠️  Inventory log write failed (non-fatal):', logErr.message);
        }

        console.log(`[Admin] ✅ Stock updated: "${current.name}" ${current.stock} → ${newStock} (Δ${delta})`);

        return res.status(200).json({
            success: true,
            message: `Stock updated to ${newStock} for "${updated.name}"`,
            data: updated,
        });
    } catch (error) {
        console.error('[Admin] ❌ Update Inventory Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to update stock.' });
    }
};

/**
 * GET /api/admin/orders
 * Fetches all orders from the past_orders table.
 */
const getOrders = async (req, res) => {
    try {
        const rows = await db
            .select({
                id: pastOrders.id,
                email: pastOrders.email,
                totalAmount: pastOrders.totalAmount,
                paymentStatus: pastOrders.paymentStatus,
                createdAt: pastOrders.createdAt,
            })
            .from(pastOrders)
            .orderBy(desc(pastOrders.createdAt));

        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('[Admin] ❌ Get Orders Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
    }
};

/**
 * GET /api/admin/customers
 * Aggregates user lifetime value and total orders by joining users with past_orders.
 */
const getCustomers = async (req, res) => {
    try {
        const rows = await db
            .select({
                id: users.id,
                email: users.email,
                name: users.name,
                joinDate: users.createdAt,
                totalOrders: sql`COUNT(${pastOrders.id})`.mapWith(Number),
                lifetimeValue: sql`COALESCE(SUM(${pastOrders.totalAmount}), 0)`.mapWith(Number),
            })
            .from(users)
            .leftJoin(pastOrders, eq(users.email, pastOrders.email))
            .where(eq(users.role, 'customer'))
            .groupBy(users.id, users.email, users.name, users.createdAt)
            .orderBy(desc(sql`COALESCE(SUM(${pastOrders.totalAmount}), 0)`));

        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('[Admin] ❌ Get Customers Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch customer directory.' });
    }
};

module.exports = { getDashboardStats, getSalesByBrand, getLowStockAlerts, getInventory, updateInventory, getOrders, getCustomers };
