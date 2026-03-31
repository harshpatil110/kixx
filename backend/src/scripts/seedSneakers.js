require('dotenv').config();
const { db, dbReadyPromise } = require('../db/index');
const {
    users,
    brands,
    products,
    productVariants,
    orders,
    orderItems,
    inventoryLogs,
} = require('../db/schema');

// ─────────────────────────────────────────────────────────────────────────────
// 40 Premium Streetwear Sneakers — 8 per brand
// Every product has a UNIQUE Unsplash image URL — no repeats.
// isNew  → products  0-9   (indices)
// isOnSale → products 10-19 (indices) — no overlap with isNew
// ─────────────────────────────────────────────────────────────────────────────
function buildCatalog(getBrandId) {
    const catalog = [
        // ═══════════════════════════ NIKE (8) ═══════════════════════════
        { brandId: getBrandId('Nike'), name: 'Air Max 90 Essential',          description: 'Classic comfort with an iconic silhouette. Built for everyday wear.',                      basePrice: '11999.00', category: 'Lifestyle',    isNew: true,  isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Nike'), name: 'Air Force 1 \'07',             description: 'The legend lives on. Crisp leather and legendary Air cushioning.',                          basePrice: '8499.00',  category: 'Classic',      isNew: true,  isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Nike'), name: 'ZoomX Vaporfly Next2',       description: 'Advanced carbon-plate racing shoe engineered for peak marathon speed.',                     basePrice: '21999.00', category: 'Running',      isNew: false, isOnSale: true,  imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Nike'), name: 'Dunk Low Retro',               description: 'Created for the hardwood but taken to the streets. A cultural icon.',                       basePrice: '9499.00',  category: 'Classic',      isNew: false, isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1612902456551-404854679e02?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Nike'), name: 'React Infinity Run 3',         description: 'A shoe built to help reduce running-related injuries with plush React foam.',               basePrice: '14499.00', category: 'Running',      isNew: false, isOnSale: true,  imageUrl: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Nike'), name: 'Air Max 97 Silver Bullet',     description: 'The full-length visible Air unit and sleek silver upper redefined sneaker design.',          basePrice: '16999.00', category: 'Lifestyle',    isNew: false, isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Nike'), name: 'Blazer Mid \'77 Vintage',      description: 'Vintage basketball charm meets modern street style. Exposed foam and retro stitching.',     basePrice: '8999.00',  category: 'Classic',      isNew: false, isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Nike'), name: 'Air Zoom Pegasus 40',          description: 'Trusted by more runners than any other shoe. 40 years of responsive cushioning.',           basePrice: '12499.00', category: 'Running',      isNew: false, isOnSale: true,  imageUrl: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=800&q=80' },

        // ═══════════════════════════ JORDAN (8) ═══════════════════════════
        { brandId: getBrandId('Jordan'), name: 'Air Jordan 1 Retro High Chicago',  description: 'The OG colourway that started everything. Banned on court, legendary off it.',      basePrice: '18999.00', category: 'Basketball',   isNew: true,  isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Jordan'), name: 'Air Jordan 4 Retro Military Black',description: 'Striking mesh panels and visible Air. A grail for sneakerheads worldwide.',            basePrice: '24999.00', category: 'Basketball',   isNew: true,  isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1600183505291-1bf33a469850?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Jordan'), name: 'Air Jordan 11 Retro Concord',      description: 'Patent leather majesty. One of the most sought-after MJs ever released.',              basePrice: '22499.00', category: 'Classic',      isNew: false, isOnSale: true,  imageUrl: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Jordan'), name: 'Jordan Luka 2',                    description: 'Built to support the deceptive speed and control of Luka Dončić.',                     basePrice: '12499.00', category: 'Performance',  isNew: false, isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1621315271772-28b1e3266e85?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Jordan'), name: 'Air Jordan 3 Retro White Cement',  description: 'The shoe that saved the Jordan line. Elephant print and visible Air.',                 basePrice: '19999.00', category: 'Basketball',   isNew: false, isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Jordan'), name: 'Air Jordan 5 Retro Fire Red',      description: 'Fighter jet-inspired design with 3M reflective tongue and shark teeth midsole.',       basePrice: '21499.00', category: 'Basketball',   isNew: false, isOnSale: true,  imageUrl: 'https://images.unsplash.com/photo-1585288766827-c62e98d70191?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Jordan'), name: 'Air Jordan 6 Retro Infrared',      description: 'MJ wore these to his first championship. Clean lines and infrared accents.',           basePrice: '19499.00', category: 'Basketball',   isNew: true,  isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Jordan'), name: 'Jordan 1 Low SE Craft',            description: 'Understated premium craft leather construction for elevated everyday wear.',            basePrice: '11999.00', category: 'Lifestyle',    isNew: false, isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=800&q=80' },

        // ═══════════════════════════ ADIDAS (8) ═══════════════════════════
        { brandId: getBrandId('Adidas'), name: 'Ultraboost Light',            description: 'Experience epic energy with the lightest Ultraboost ever made.',                           basePrice: '16999.00', category: 'Running',      isNew: true,  isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Adidas'), name: 'YEEZY BOOST 350 V2 Zebra',   description: 'The defining silhouette of the modern sneaker era. Primeknit and Boost unite.',             basePrice: '22999.00', category: 'Exclusive',    isNew: false, isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810baa3?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Adidas'), name: 'Samba OG',                    description: 'Born on the pitch, the Samba is a timeless icon of street style.',                          basePrice: '8999.00',  category: 'Classic',      isNew: false, isOnSale: true,  imageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Adidas'), name: 'NMD_R1 V2',                   description: 'Streamlined, progressive street style with plush Boost cushioning.',                       basePrice: '13599.00', category: 'Lifestyle',    isNew: false, isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Adidas'), name: 'Forum Low',                   description: 'Premium leather and a classic hardwood profile. An 80s icon.',                              basePrice: '9999.00',  category: 'Classic',      isNew: false, isOnSale: true,  imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Adidas'), name: 'Gazelle Indoor',              description: 'Retro terrace style meets modern street culture. Suede upper.',                             basePrice: '10499.00', category: 'Classic',      isNew: true,  isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Adidas'), name: 'Adizero Adios Pro 3',         description: 'Carbon-rod racing flat built for world-record pace.',                                      basePrice: '24999.00', category: 'Running',      isNew: false, isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Adidas'), name: 'YEEZY Slide Onyx',            description: 'Minimalist luxury foam slide. The streetwear staple for post-workout recovery.',            basePrice: '8499.00',  category: 'Lifestyle',    isNew: false, isOnSale: true,  imageUrl: 'https://images.unsplash.com/photo-1584735174914-5a4e6c5e4b2a?auto=format&fit=crop&w=800&q=80' },

        // ═══════════════════════════ NEW BALANCE (8) ═══════════════════════
        { brandId: getBrandId('New Balance'), name: 'Made in USA 990v6',      description: 'The standard-bearer of the 990 series. Legendary comfort, made in America.',               basePrice: '19999.00', category: 'Running',      isNew: true,  isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('New Balance'), name: '550 White/Green',         description: 'A retro basketball oxford honoring the 1989 original. Tumbled leather.',                   basePrice: '10999.00', category: 'Classic',      isNew: false, isOnSale: true,  imageUrl: 'https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('New Balance'), name: 'Fresh Foam 1080v13',     description: 'The pinnacle of New Balance cushioning technology. Ultra-plush ride.',                      basePrice: '14999.00', category: 'Running',      isNew: false, isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('New Balance'), name: '2002R Protection Pack',  description: 'Deconstructed upper design meets modern performance heritage.',                             basePrice: '15999.00', category: 'Lifestyle',    isNew: false, isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('New Balance'), name: '327 Retro Brights',      description: 'A bold, angular redesign of classic 1970s running shoes.',                                  basePrice: '8499.00',  category: 'Lifestyle',    isNew: false, isOnSale: true,  imageUrl: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('New Balance'), name: '9060 Sea Salt',          description: 'Futuristic silhouette with layered textures and ABZORB midsole cushioning.',                basePrice: '16499.00', category: 'Lifestyle',    isNew: true,  isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('New Balance'), name: 'FuelCell SuperComp Elite v4', description: 'Energy-returning carbon plate racer designed for sub-elite marathon runners.',          basePrice: '22999.00', category: 'Running',      isNew: false, isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('New Balance'), name: '574 Core Grey',          description: 'The quintessential dad shoe. ENCAP midsole support since 1988.',                             basePrice: '8999.00',  category: 'Classic',      isNew: false, isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=800&q=80' },

        // ═══════════════════════════ PUMA (8) ═══════════════════════════
        { brandId: getBrandId('Puma'), name: 'Suede Classic XXI',             description: 'The original B-boy shoe. Half a century of streetwear royalty.',                             basePrice: '8499.00',  category: 'Classic',      isNew: false, isOnSale: true,  imageUrl: 'https://images.unsplash.com/photo-1520256862855-398228c41684?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Puma'), name: 'RS-X Reinvention',              description: 'Bold colour-blocking and chunky proportions. The ultimate dad-tech runner.',                 basePrice: '11499.00', category: 'Lifestyle',    isNew: true,  isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Puma'), name: 'Palermo Leather',               description: 'Italian terrace culture meets everyday versatility. Butter-soft leather upper.',              basePrice: '9999.00',  category: 'Classic',      isNew: false, isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1465453869711-7e174808ace9?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Puma'), name: 'MB.03 LaMelo Ball',             description: 'LaMelo\'s signature shoe. Nitro foam and wild colourways for the fearless.',                 basePrice: '14999.00', category: 'Basketball',   isNew: false, isOnSale: true,  imageUrl: 'https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Puma'), name: 'Deviate NITRO Elite 2',         description: 'Carbon-plated distance racer with NITRO foam. Sub-3-hour marathon weapon.',                  basePrice: '19999.00', category: 'Running',      isNew: false, isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1562183241-b937e95585b6?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Puma'), name: 'Clyde All-Pro',                 description: 'On-court heritage meets modern hoops tech. Homage to Walt "Clyde" Frazier.',                 basePrice: '12999.00', category: 'Basketball',   isNew: false, isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1576672843344-f01907a9d40c?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Puma'), name: 'Speedcat OG Sparco',            description: 'Born in motorsport. The low-profile driving shoe that became a street icon.',                basePrice: '10999.00', category: 'Lifestyle',    isNew: false, isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=800&q=80' },
        { brandId: getBrandId('Puma'), name: 'PUMA x FENTY Creeper',          description: 'Rihanna\'s punk-luxe platform sneaker. Thick sole, premium suede upper.',                   basePrice: '15999.00', category: 'Exclusive',    isNew: false, isOnSale: false, imageUrl: 'https://images.unsplash.com/photo-1581101767113-1677fc2beaa8?auto=format&fit=crop&w=800&q=80' },
    ];
    return catalog.map(p => ({
        ...p,
        stock: Math.floor(Math.random() * (1000 - 10 + 1)) + 10
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant generation — 5 sizes × 2 random colours per product
// ─────────────────────────────────────────────────────────────────────────────
const SIZES = ['7', '8', '9', '10', '11'];
const COLOURS = ['Black', 'White', 'Red', 'Grey', 'Blue', 'Cream', 'Green'];

function buildVariants(insertedProducts) {
    const variants = [];
    const seenSkus = new Set();

    insertedProducts.forEach((product, productIndex) => {
        // Fisher-Yates shuffle for truly unique picks
        const pool = [...COLOURS];
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        const productColours = pool.slice(0, 2);

        productColours.forEach((colour) => {
            SIZES.forEach((size) => {
                const sku = `SKU-P${productIndex}-${colour.toUpperCase().slice(0, 3)}-SZ${size}`;
                if (!seenSkus.has(sku)) {
                    seenSkus.add(sku);
                    variants.push({
                        productId: product.id,
                        sku,
                        size,
                        color: colour,
                        stock: Math.floor(Math.random() * 25) + 5, // 5–30
                    });
                }
            });
        });
    });

    return variants;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main script
// ─────────────────────────────────────────────────────────────────────────────
async function seedSneakers() {
    console.log('🌱 Waiting for database connection…');
    await dbReadyPromise;
    console.log('✅ Connection ready. Starting KIXX Premium Catalog Seed (40 sneakers)…\n');

    // ── A. Clear existing data (reverse FK order) ──
    console.log('🧹 Clearing existing data…');
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(productVariants);
    await db.delete(inventoryLogs);
    await db.delete(products);
    await db.delete(brands);
    await db.delete(users);
    console.log('   Done.\n');

    // ── B. Seed users ──
    console.log('👤 Seeding users (Admin + Customers)…');
    const insertedUsers = await db.insert(users).values([
        { name: "Admin", email: "admin@kixx.com", passwordHash: "hashedpassword123", role: "admin" },
        { name: "Customer One", email: "customer1@kixx.com", passwordHash: "hashedpassword1", role: "customer" },
        { name: "Customer Two", email: "customer2@kixx.com", passwordHash: "hashedpassword2", role: "customer" }
    ]).returning();
    console.log(`   ✅ Created ${insertedUsers.length} users.\n`);

    // ── C. Seed 5 brands ──
    console.log('🏢 Seeding Brands…');
    const insertedBrands = await db.insert(brands).values([
        { name: 'Nike',        logoUrl: 'https://example.com/nike.png' },
        { name: 'Jordan',      logoUrl: 'https://example.com/jordan.png' },
        { name: 'Adidas',      logoUrl: 'https://example.com/adidas.png' },
        { name: 'New Balance',  logoUrl: 'https://example.com/nb.png' },
        { name: 'Puma',         logoUrl: 'https://example.com/puma.png' },
    ]).returning();
    console.log(`   ✅ Created ${insertedBrands.length} brands.\n`);

    const getBrandId = (name) => insertedBrands.find((b) => b.name === name).id;

    // ── D. Seed 40 products ──
    console.log('👟 Seeding 40 Premium Sneakers…');
    const catalogData = buildCatalog(getBrandId);
    const insertedProducts = await db.insert(products).values(catalogData).returning();
    console.log(`   ✅ Created ${insertedProducts.length} products.\n`);

    // ── D.2 Seed Inventory Logs ──
    console.log('📦 Seeding Inventory Logs…');
    const inventoryLogsData = insertedProducts.map(p => ({
        productId: p.id,
        changeType: 'RESTOCK',
        quantityChanged: p.stock
    }));
    await db.insert(inventoryLogs).values(inventoryLogsData);
    console.log(`   ✅ Created ${inventoryLogsData.length} initial inventory logs.\n`);

    // Stats
    const newCount = catalogData.filter((p) => p.isNew).length;
    const saleCount = catalogData.filter((p) => p.isOnSale).length;
    console.log(`   📊 isNew: ${newCount}  |  isOnSale: ${saleCount}  |  Regular: ${catalogData.length - newCount - saleCount}\n`);

    // ── E. Seed variants (5 sizes × 2 colours per product) ──
    console.log('🎨 Seeding Product Variants…');
    const variantsData = buildVariants(insertedProducts);
    const insertedVariants = await db.insert(productVariants).values(variantsData).returning();
    console.log(`   ✅ Created ${insertedVariants.length} variants.\n`);

    // ── Done ──
    console.log('═══════════════════════════════════════════════');
    console.log('🎉 Successfully seeded 40 sneakers!');
    console.log('═══════════════════════════════════════════════');
    process.exit(0);
}

seedSneakers()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('❌ Seed failed:', err);
        process.exit(1);
    });
