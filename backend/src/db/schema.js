const { pgTable, uuid, varchar, text, decimal, integer, timestamp, pgEnum } = require('drizzle-orm/pg-core');
const { relations } = require('drizzle-orm');

// ENUMS
const roleEnum = pgEnum('role', ['user', 'admin']);
const orderStatusEnum = pgEnum('status', ['pending', 'paid', 'shipped', 'delivered', 'cancelled']);

// 3.1 User Model
const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }),
    email: varchar('email', { length: 255 }).unique().notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: roleEnum('role').default('user'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

// 3.2 Brand Model
const brands = pgTable('brands', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    logoUrl: varchar('logo_url', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

// 3.3 Product Model
const products = pgTable('products', {
    id: uuid('id').primaryKey().defaultRandom(),
    brandId: uuid('brand_id').references(() => brands.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
    category: varchar('category', { length: 255 }),
    imageUrl: varchar('image_url', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

// 3.4 ProductVariant Model
const productVariants = pgTable('product_variants', {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    size: varchar('size', { length: 50 }).notNull(),
    color: varchar('color', { length: 50 }).notNull(),
    stock: integer('stock').default(0).notNull(),
    sku: varchar('sku', { length: 100 }).unique().notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

// 3.5 Order Model
const orders = pgTable('orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
    status: orderStatusEnum('status').default('pending').notNull(),
    paymentId: varchar('payment_id', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

// 3.6 OrderItem Model
const orderItems = pgTable('order_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').references(() => orders.id).notNull(),
    variantId: uuid('variant_id').references(() => productVariants.id).notNull(),
    quantity: integer('quantity').notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});


// RELATIONSHIPS
const usersRelations = relations(users, ({ many }) => ({
    orders: many(orders)
}));

const brandsRelations = relations(brands, ({ many }) => ({
    products: many(products)
}));

const productsRelations = relations(products, ({ one, many }) => ({
    brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
    variants: many(productVariants)
}));

const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
    product: one(products, { fields: [productVariants.productId], references: [products.id] }),
    orderItems: many(orderItems)
}));

const ordersRelations = relations(orders, ({ one, many }) => ({
    user: one(users, { fields: [orders.userId], references: [users.id] }),
    items: many(orderItems)
}));

const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
    variant: one(productVariants, { fields: [orderItems.variantId], references: [productVariants.id] })
}));

module.exports = {
    roleEnum,
    orderStatusEnum,
    users,
    brands,
    products,
    productVariants,
    orders,
    orderItems,
    usersRelations,
    brandsRelations,
    productsRelations,
    productVariantsRelations,
    ordersRelations,
    orderItemsRelations
};
