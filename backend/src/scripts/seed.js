require('dotenv').config();
const { db, queryClient } = require('../db/index');
const {
    users,
    brands,
    products,
    productVariants,
    orders,
    orderItems
} = require('../db/schema');

async function runSeed() {
    console.log('🌱 Starting Database Seeding Process...');

    // Step A: Clear Existing Data (Reverse Relational Order)
    console.log('🧹 Clearing existing data...');
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(productVariants);
    await db.delete(products);
    await db.delete(brands);
    await db.delete(users);

    // Step B: Insert Users
    console.log('👤 Seeding Users...');
    const [admin] = await db.insert(users).values({
        name: "Admin User",
        email: "admin@kixx.com",
        role: "admin",
        passwordHash: "firebase_handles_auth_but_required_for_schema"
    }).returning();
    console.log(`✅ Admin base profile created: ${admin.email}`);

    // Step C: Insert Brands
    console.log('🏢 Seeding Brands...');
    const insertedBrands = await db.insert(brands).values([
        { name: "Nike", description: "Just Do It", logoUrl: "https://example.com/nike.png" },
        { name: "Adidas", description: "Impossible is Nothing", logoUrl: "https://example.com/adidas.png" },
        { name: "Puma", description: "Forever Faster", logoUrl: "https://example.com/puma.png" },
        { name: "New Balance", description: "Fearlessly Independent", logoUrl: "https://example.com/nb.png" }
    ]).returning();
    console.log(`✅ Created ${insertedBrands.length} brands.`);

    // Step D: Insert Products
    console.log('👟 Seeding Products...');
    let allProducts = [];
    for (const brand of insertedBrands) {
        const productsToProcess = [];
        if (brand.name === "Nike") {
            productsToProcess.push({ brandId: brand.id, name: "Air Max 90", description: "Iconic Nike sneaker.", basePrice: "130.00", category: "Running" });
            productsToProcess.push({ brandId: brand.id, name: "Air Force 1", description: "Classic court shoe.", basePrice: "110.00", category: "Basketball" });
        } else if (brand.name === "Adidas") {
            productsToProcess.push({ brandId: brand.id, name: "Ultraboost 22", description: "Premium running shoe.", basePrice: "190.00", category: "Running" });
            productsToProcess.push({ brandId: brand.id, name: "Stan Smith", description: "Timeless classic.", basePrice: "100.00", category: "Casual" });
        } else if (brand.name === "Puma") {
            productsToProcess.push({ brandId: brand.id, name: "Suede Classic", description: "Old school style.", basePrice: "75.00", category: "Casual" });
            productsToProcess.push({ brandId: brand.id, name: "RS-X3", description: "Extreme running shoe.", basePrice: "110.00", category: "Running" });
        } else if (brand.name === "New Balance") {
            productsToProcess.push({ brandId: brand.id, name: "574 Core", description: "Most New Balance shoe ever.", basePrice: "85.00", category: "Casual" });
            productsToProcess.push({ brandId: brand.id, name: "990v5", description: "Premium lifestyle shoe.", basePrice: "185.00", category: "Running" });
        }
        const insertedChunk = await db.insert(products).values(productsToProcess).returning();
        allProducts.push(...insertedChunk);
    }
    console.log(`✅ Created ${allProducts.length} products.`);

    // Step E: Insert Variants
    console.log('🎨 Seeding Product Variants...');
    const variantsToInsert = [];
    allProducts.forEach((product, i) => {
        const sizes = ["8", "9", "10"];
        const colors = ["Black", "White"];

        // Assign one color per product for variance, and loop sizes
        const color = colors[i % 2];

        sizes.forEach(size => {
            variantsToInsert.push({
                productId: product.id,
                sku: `PROD-${product.id.split('-')[0]}-${color.toUpperCase().slice(0, 3)}-SZ${size}`,
                size: size,
                color: color,
                price: product.basePrice,
                stock: Math.floor(Math.random() * 41) + 10 // random between 10 and 50
            });
        });
    });

    const insertedVariants = await db.insert(productVariants).values(variantsToInsert).returning();
    console.log(`✅ Created ${insertedVariants.length} product variants with generated stocks.`);

    console.log('🎉 Database Seeding Complete!');
    await queryClient.end();
}

runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('❌ Database Seeding Failed:', err);
        queryClient.end().then(() => process.exit(1));
    });
