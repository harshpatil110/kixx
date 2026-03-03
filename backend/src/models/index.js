// Re-export standard Drizzle schema mapping models for compatibility
const schema = require('../db/schema');

module.exports = {
    User: schema.users,
    Brand: schema.brands,
    Product: schema.products,
    ProductVariant: schema.productVariants,
    Order: schema.orders,
    OrderItem: schema.orderItems
};
