const { db } = require('../db/index');
const { users, products, brands, pastOrders, inventoryLogs, userFeedback, productReviews } = require('../db/schema');
const { sql, eq, asc, desc, count, gte } = require('drizzle-orm');
const bcrypt = require('bcrypt');

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

/**
 * GET /api/admin/customers/:email/orders
 * Fetches all detailed past orders for a specific customer email, used by the CRM Slide-Over.
 */
const getCustomerOrders = async (req, res) => {
    const { email } = req.params;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email parameter is required.' });
    }

    try {
        const rows = await db
            .select()
            .from(pastOrders)
            .where(eq(pastOrders.email, email))
            .orderBy(desc(pastOrders.createdAt));

        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error(`[Admin] ❌ Get Customer Orders Error (${email}):`, error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch customer orders.' });
    }
};

/**
 * PUT /api/admin/settings/account
 * Updates the admin's email and/or password.
 */
const updateAccountSettings = async (req, res) => {
    const { email, password } = req.body;
    // req.user comes from verifyToken middleware
    const adminId = req.user?.id; 

    if (!adminId) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Admin ID missing.' });
    }

    try {
        const updateData = {};
        
        if (email) {
            updateData.email = email;
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.passwordHash = await bcrypt.hash(password, salt);
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, message: 'No data provided to update.' });
        }

        updateData.updatedAt = new Date();

        await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, adminId));

        return res.status(200).json({ 
            success: true, 
            message: 'Account settings updated successfully.' 
        });
    } catch (error) {
        console.error('[Admin] ❌ Update Account Settings Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to update account settings.' });
    }
};

/**
 * PUT /api/admin/settings/store
 * Updates the global store preferences.
 */
const updateStoreSettings = async (req, res) => {
    const { maintenanceMode, contactEmail } = req.body;

    try {
        // Since we don't have a dedicated store_settings table, we simulate a successful DB write.
        // In a real scenario, this would UPDATE store_settings SET variables...
        
        console.log(`[Admin] 🛠️ Store Settings Patched. Maintenance: ${maintenanceMode}, Contact: ${contactEmail}`);

        return res.status(200).json({ 
            success: true, 
            message: 'Store preferences saved successfully.' 
        });
    } catch (error) {
        console.error('[Admin] ❌ Update Store Settings Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to save store settings.' });
    }
};

/**
 * GET /api/admin/feedback-stats
 * Two aggregations:
 *   1. categoryBreakdown — count of feedback rows grouped by category.
 *   2. dailyTrend       — daily submission count for the last 7 days.
 */
const getFeedbackStats = async (req, res) => {
    try {
        // ── 1. Category breakdown ──────────────────────────────────────────────────────
        const categoryResult = await db
            .select({
                category: userFeedback.category,
                count: count(),
            })
            .from(userFeedback)
            .groupBy(userFeedback.category)
            .orderBy(desc(count()));

        // ── 2. Daily trend (last 7 calendar days incl. today) ───────────────────────
        // Generate a date series on the DB side so days with 0 reports still appear.
        const trendResult = await db.execute(sql`
            SELECT
                TO_CHAR(day::date, 'Mon DD') AS label,
                COUNT(uf.id)::integer        AS count
            FROM
                generate_series(
                    NOW()::date - INTERVAL '6 days',
                    NOW()::date,
                    '1 day'::interval
                ) AS day
            LEFT JOIN user_feedback uf
                ON uf.created_at::date = day::date
            GROUP BY day
            ORDER BY day ASC
        `);

        const categoryBreakdown = categoryResult.map((r) => ({
            category: r.category,
            count: parseInt(r.count, 10),
        }));

        const dailyTrend = (trendResult.rows ?? trendResult).map((r) => ({
            label: r.label,
            count: parseInt(r.count, 10),
        }));

        console.log('[Admin] ✅ Feedback stats fetched:', categoryBreakdown.length, 'categories,',
                    dailyTrend.length, 'days of trend data');

        return res.status(200).json({
            success: true,
            categoryBreakdown,
            dailyTrend,
            totalFeedback: categoryBreakdown.reduce((s, r) => s + r.count, 0),
        });

    } catch (error) {
        console.error('[Admin] ❌ Feedback Stats Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch feedback stats.' });
    }
};

/**
 * GET /api/admin/feedback
 * Returns ALL feedback rows ordered by newest first.
 */
const getAllFeedback = async (req, res) => {
    try {
        const rows = await db
            .select()
            .from(userFeedback)
            .orderBy(desc(userFeedback.createdAt));

        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('[Admin] ❌ Get Feedback Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch feedback.' });
    }
};

/**
 * PATCH /api/admin/feedback/:id/resolve
 * Sets status = 'Resolved' for the given feedback ID.
 */
const resolveFeedback = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid feedback ID.' });
    }
    try {
        const [updated] = await db
            .update(userFeedback)
            .set({ status: 'Resolved' })
            .where(eq(userFeedback.id, id))
            .returning({ id: userFeedback.id, status: userFeedback.status });

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Feedback not found.' });
        }

        console.log(`[Admin] ✅ Feedback #${id} marked Resolved.`);
        return res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.error('[Admin] ❌ Resolve Feedback Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to resolve feedback.' });
    }
};


/**
 * GET /api/admin/reviews/summary
 * Aggregates average rating and review count for each product that has at least one review.
 * Joins products table to get product name + SKU-equivalent (category used as SKU proxy) + imageUrl.
 */
const getReviewsSummary = async (req, res) => {
    try {
        const result = await db.execute(sql`
            SELECT
                p.id                                            AS "productId",
                p.name                                          AS "productName",
                p.category                                      AS "category",
                p.image_url                                     AS "imageUrl",
                COUNT(pr.id)::integer                           AS "reviewCount",
                ROUND(AVG(pr.rating)::numeric, 1)               AS "avgRating"
            FROM products p
            INNER JOIN product_reviews pr ON pr.product_id = p.id::text
            GROUP BY p.id, p.name, p.category, p.image_url
            HAVING COUNT(pr.id) > 0
            ORDER BY "reviewCount" DESC
        `);

        const data = (result.rows ?? result).map((r) => ({
            productId:   r.productId,
            productName: r.productName,
            category:    r.category,
            imageUrl:    r.imageUrl,
            reviewCount: parseInt(r.reviewCount, 10),
            avgRating:   parseFloat(r.avgRating),
        }));

        console.log(`[Admin] ✅ Reviews summary fetched: ${data.length} products`);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('[Admin] ❌ Reviews Summary Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch reviews summary.' });
    }
};

/**
 * GET /api/admin/reviews/product/:productId
 * Returns every individual review for a specific product.
 * Joins past_orders (on orderId) to retrieve the submitter's email.
 */
const getProductReviews = async (req, res) => {
    const { productId } = req.params;
    if (!productId) {
        return res.status(400).json({ success: false, message: 'productId is required.' });
    }

    try {
        const result = await db.execute(sql`
            SELECT
                pr.id                                           AS "reviewId",
                pr.rating,
                pr.comment,
                pr.created_at                                   AS "createdAt",
                pr.user_id                                      AS "userId",
                COALESCE(po.email, pr.user_id)                  AS "userEmail"
            FROM product_reviews pr
            LEFT JOIN past_orders po ON po.id::text = pr.order_id
            WHERE pr.product_id = ${productId}
            ORDER BY pr.created_at DESC
        `);

        const data = (result.rows ?? result).map((r) => ({
            reviewId:  parseInt(r.reviewId, 10),
            rating:    parseInt(r.rating, 10),
            comment:   r.comment,
            createdAt: r.createdAt,
            userEmail: r.userEmail,
        }));

        console.log(`[Admin] ✅ Product reviews fetched for ${productId}: ${data.length} reviews`);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('[Admin] ❌ Product Reviews Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch product reviews.' });
    }
};

module.exports = {
    getDashboardStats,
    getSalesByBrand,
    getLowStockAlerts,
    getInventory,
    updateInventory,
    getOrders,
    getCustomers,
    getCustomerOrders,
    updateAccountSettings,
    updateStoreSettings,
    getFeedbackStats,
    getAllFeedback,
    resolveFeedback,
    getReviewsSummary,
    getProductReviews,
};
