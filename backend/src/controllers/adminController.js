const { db } = require('../db/index');
const { users, products, brands, pastOrders } = require('../db/schema');
const { sql, eq, asc, count } = require('drizzle-orm');

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

module.exports = { getDashboardStats, getSalesByBrand, getLowStockAlerts };
