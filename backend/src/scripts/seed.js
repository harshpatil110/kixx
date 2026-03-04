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
    console.log('🌱 Starting Database Seeding Process (INR Localization & Premium Catalog)...');

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
        { name: "Jordan", description: "Become Legendary", logoUrl: "https://example.com/jordan.png" },
        { name: "New Balance", description: "Fearlessly Independent", logoUrl: "https://example.com/nb.png" }
    ]).returning();
    console.log(`✅ Created ${insertedBrands.length} brands.`);

    // Step D: Insert Products
    console.log('👟 Seeding Catalog...');
    const allProductsToProcess = [];

    // Helper to get brand ID
    const getBrandId = (name) => insertedBrands.find(b => b.name === name).id;

    // Define the full catalog (18 high-quality products)
    const catalogData = [
        // --- NIKE ---
        { brandId: getBrandId('Nike'), name: 'Air Max 90 Essentials', description: 'Classic comfort with an iconic silhouette. Built for everyday wear.', basePrice: '11999.00', category: 'Lifestyle', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Nike'), name: 'Air Force 1 \'07', description: 'The legend lives on in the Nike Air Force 1.', basePrice: '8499.00', category: 'Classic', imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Nike'), name: 'ZoomX Vaporfly Next% 2', description: 'Advanced racing shoes engineered for peak speed and energy return.', basePrice: '21999.00', category: 'Running', imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Nike'), name: 'React Infinity Run 3', description: 'A shoe built to help reduce running-related injuries.', basePrice: '14499.00', category: 'Running', imageUrl: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=800&q=80' },

        // --- ADIDAS ---
        { brandId: getBrandId('Adidas'), name: 'Ultraboost Light', description: 'Experience epic energy with the lightest Ultraboost ever.', basePrice: '16999.00', category: 'Running', imageUrl: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Adidas'), name: 'Samba OG', description: 'Born on the pitch, the Samba is a timeless icon of street style.', basePrice: '8999.00', category: 'Classic', imageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Adidas'), name: 'NMD_R1 V2', description: 'Streamlined, progressive street style with plush Boost cushioning.', basePrice: '13599.00', category: 'Lifestyle', imageUrl: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Adidas'), name: 'YEEZY BOOST 350 V2', description: 'The defining silhouette of the modern sneaker era.', basePrice: '22999.00', category: 'Exclusive', imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810baa3?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Adidas'), name: 'Forum Low', description: 'Premium leather and a classic hardwood profile.', basePrice: '9999.00', category: 'Classic', imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80' },

        // --- JORDAN ---
        { brandId: getBrandId('Jordan'), name: 'Air Jordan 1 Retro High', description: 'The shoe that started it all. Premium leather and classic colors.', basePrice: '18999.00', category: 'Basketball', imageUrl: 'https://images.unsplash.com/photo-1600183505291-1bf33a469850?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Jordan'), name: 'Air Jordan 4 Retro', description: 'Striking design and premium aesthetic, beloved by sneakerheads.', basePrice: '24999.00', category: 'Basketball', imageUrl: 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Jordan'), name: 'Jordan Luka 2', description: 'Built to support the deceptive speed and control of Luka Dončić.', basePrice: '12499.00', category: 'Performance', imageUrl: 'https://images.unsplash.com/photo-1621315271772-28b1e3266e85?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Jordan'), name: 'Air Jordan 11 Retro', description: 'Patent leather majesty. One of the most sought-after MJs ever.', basePrice: '22499.00', category: 'Classic', imageUrl: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80' },

        // --- NEW BALANCE ---
        { brandId: getBrandId('New Balance'), name: 'Made in USA 990v6', description: 'The standard-bearer of the 990 series. Legendary comfort.', basePrice: '19999.00', category: 'Running', imageUrl: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('New Balance'), name: '550 Vintage White', description: 'A retro basketball oxford honoring the 1989 original.', basePrice: '10999.00', category: 'Classic', imageUrl: 'https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('New Balance'), name: 'Fresh Foam 1080v13', description: 'The pinnacle of New Balance cushioning technology.', basePrice: '14999.00', category: 'Running', imageUrl: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('New Balance'), name: '2002R Protection Pack', description: 'Deconstructed upper design meets modern performance.', basePrice: '15999.00', category: 'Lifestyle', imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('New Balance'), name: '327 Lifestyle', description: 'A bold, angular redesign of classic 1970s running shoes.', basePrice: '8499.00', category: 'Lifestyle', imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80' }
    ];

    let insertedProducts = [];
    // Insert in chunks or all at once
    insertedProducts = await db.insert(products).values(catalogData).returning();

    console.log(`✅ Created ${insertedProducts.length} Premium Products.`);

    // Step E: Insert Variants
    console.log('🎨 Seeding Product Variants...');
    const variantsToInsert = [];

    const sizes = ["7", "8", "9", "10", "11"];
    const colors = ["Black", "White", "Red", "Grey", "Blue"];

    insertedProducts.forEach((product) => {
        // Pick 2 random colors for this product to keep variations interesting
        const productColors = [
            colors[Math.floor(Math.random() * colors.length)],
            colors[Math.floor(Math.random() * colors.length)]
        ];

        // Deduplicate colors
        const uniqueColors = [...new Set(productColors)];

        uniqueColors.forEach(color => {
            sizes.forEach(size => {
                variantsToInsert.push({
                    productId: product.id,
                    sku: `PROD-${product.id.split('-')[0]}-${color.toUpperCase().slice(0, 3)}-SZ${size}`,
                    size: size,
                    color: color,
                    // Keeping price same as basePrice, though variant prices could differ in reality
                    price: product.basePrice,
                    stock: Math.floor(Math.random() * 25) + 5 // random between 5 and 30
                });
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
