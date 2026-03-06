require('dotenv').config();
const { db, dbReadyPromise } = require('../db/index');
const {
    users,
    brands,
    products,
    productVariants,
    orders,
    orderItems,
} = require('../db/schema');

// ─────────────────────────────────────────────────────────────────────────────
// 8 guaranteed high-quality Unsplash sneaker images — rotated across 40 items
// ─────────────────────────────────────────────────────────────────────────────
const IMAGES = [
    'https://images.unsplash.com/photo-1552346154-21d32810baa3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=800&q=80',
];

const img = (i) => IMAGES[i % IMAGES.length];

// ─────────────────────────────────────────────────────────────────────────────
// 40 Premium Streetwear Sneakers — 8 per brand
// isNew  → products  0-9   (indices)
// isOnSale → products 10-19 (indices) — no overlap with isNew
// ─────────────────────────────────────────────────────────────────────────────
function buildCatalog(getBrandId) {
    return [
        // ═══════════════════════════ NIKE (8) ═══════════════════════════
        { brandId: getBrandId('Nike'), name: 'Air Max 90 Essential',          description: 'Classic comfort with an iconic silhouette. Built for everyday wear.',                      basePrice: '11999.00', category: 'Lifestyle',    isNew: true,  isOnSale: false, imageUrl: img(0) },
        { brandId: getBrandId('Nike'), name: 'Air Force 1 \'07',             description: 'The legend lives on. Crisp leather and legendary Air cushioning.',                          basePrice: '8499.00',  category: 'Classic',      isNew: true,  isOnSale: false, imageUrl: img(1) },
        { brandId: getBrandId('Nike'), name: 'ZoomX Vaporfly Next% 2',       description: 'Advanced carbon-plate racing shoe engineered for peak marathon speed.',                     basePrice: '21999.00', category: 'Running',      isNew: false, isOnSale: true,  imageUrl: img(2) },
        { brandId: getBrandId('Nike'), name: 'Dunk Low Retro',               description: 'Created for the hardwood but taken to the streets. A cultural icon.',                       basePrice: '9499.00',  category: 'Classic',      isNew: false, isOnSale: false, imageUrl: img(3) },
        { brandId: getBrandId('Nike'), name: 'React Infinity Run 3',         description: 'A shoe built to help reduce running-related injuries with plush React foam.',               basePrice: '14499.00', category: 'Running',      isNew: false, isOnSale: true,  imageUrl: img(4) },
        { brandId: getBrandId('Nike'), name: 'Air Max 97 Silver Bullet',     description: 'The full-length visible Air unit and sleek silver upper redefined sneaker design.',          basePrice: '16999.00', category: 'Lifestyle',    isNew: false, isOnSale: false, imageUrl: img(5) },
        { brandId: getBrandId('Nike'), name: 'Blazer Mid \'77 Vintage',      description: 'Vintage basketball charm meets modern street style. Exposed foam and retro stitching.',     basePrice: '8999.00',  category: 'Classic',      isNew: false, isOnSale: false, imageUrl: img(6) },
        { brandId: getBrandId('Nike'), name: 'Air Zoom Pegasus 40',          description: 'Trusted by more runners than any other shoe. 40 years of responsive cushioning.',           basePrice: '12499.00', category: 'Running',      isNew: false, isOnSale: true,  imageUrl: img(7) },

        // ═══════════════════════════ JORDAN (8) ═══════════════════════════
        { brandId: getBrandId('Jordan'), name: 'Air Jordan 1 Retro High Chicago',  description: 'The OG colourway that started everything. Banned on court, legendary off it.',      basePrice: '18999.00', category: 'Basketball',   isNew: true,  isOnSale: false, imageUrl: img(0) },
        { brandId: getBrandId('Jordan'), name: 'Air Jordan 4 Retro Military Black',description: 'Striking mesh panels and visible Air. A grail for sneakerheads worldwide.',            basePrice: '24999.00', category: 'Basketball',   isNew: true,  isOnSale: false, imageUrl: img(1) },
        { brandId: getBrandId('Jordan'), name: 'Air Jordan 11 Retro Concord',      description: 'Patent leather majesty. One of the most sought-after MJs ever released.',              basePrice: '22499.00', category: 'Classic',      isNew: false, isOnSale: true,  imageUrl: img(2) },
        { brandId: getBrandId('Jordan'), name: 'Jordan Luka 2',                    description: 'Built to support the deceptive speed and control of Luka Dončić.',                     basePrice: '12499.00', category: 'Performance',  isNew: false, isOnSale: false, imageUrl: img(3) },
        { brandId: getBrandId('Jordan'), name: 'Air Jordan 3 Retro White Cement',  description: 'The shoe that saved the Jordan line. Elephant print and visible Air.',                 basePrice: '19999.00', category: 'Basketball',   isNew: false, isOnSale: false, imageUrl: img(4) },
        { brandId: getBrandId('Jordan'), name: 'Air Jordan 5 Retro Fire Red',      description: 'Fighter jet-inspired design with 3M reflective tongue and shark teeth midsole.',       basePrice: '21499.00', category: 'Basketball',   isNew: false, isOnSale: true,  imageUrl: img(5) },
        { brandId: getBrandId('Jordan'), name: 'Air Jordan 6 Retro Infrared',      description: 'MJ wore these to his first championship. Clean lines and infrared accents.',           basePrice: '19499.00', category: 'Basketball',   isNew: true,  isOnSale: false, imageUrl: img(6) },
        { brandId: getBrandId('Jordan'), name: 'Jordan 1 Low SE Craft',            description: 'Understated premium craft leather construction for elevated everyday wear.',            basePrice: '11999.00', category: 'Lifestyle',    isNew: false, isOnSale: false, imageUrl: img(7) },

        // ═══════════════════════════ ADIDAS (8) ═══════════════════════════
        { brandId: getBrandId('Adidas'), name: 'Ultraboost Light',            description: 'Experience epic energy with the lightest Ultraboost ever made.',                           basePrice: '16999.00', category: 'Running',      isNew: true,  isOnSale: false, imageUrl: img(0) },
        { brandId: getBrandId('Adidas'), name: 'YEEZY BOOST 350 V2 Zebra',   description: 'The defining silhouette of the modern sneaker era. Primeknit and Boost unite.',             basePrice: '22999.00', category: 'Exclusive',    isNew: false, isOnSale: false, imageUrl: img(1) },
        { brandId: getBrandId('Adidas'), name: 'Samba OG',                    description: 'Born on the pitch, the Samba is a timeless icon of street style.',                          basePrice: '8999.00',  category: 'Classic',      isNew: false, isOnSale: true,  imageUrl: img(2) },
        { brandId: getBrandId('Adidas'), name: 'NMD_R1 V2',                   description: 'Streamlined, progressive street style with plush Boost cushioning.',                       basePrice: '13599.00', category: 'Lifestyle',    isNew: false, isOnSale: false, imageUrl: img(3) },
        { brandId: getBrandId('Adidas'), name: 'Forum Low',                   description: 'Premium leather and a classic hardwood profile. An 80s icon.',                              basePrice: '9999.00',  category: 'Classic',      isNew: false, isOnSale: true,  imageUrl: img(4) },
        { brandId: getBrandId('Adidas'), name: 'Gazelle Indoor',              description: 'Retro terrace style meets modern street culture. Suede upper.',                             basePrice: '10499.00', category: 'Classic',      isNew: true,  isOnSale: false, imageUrl: img(5) },
        { brandId: getBrandId('Adidas'), name: 'Adizero Adios Pro 3',         description: 'Carbon-rod racing flat built for world-record pace.',                                      basePrice: '24999.00', category: 'Running',      isNew: false, isOnSale: false, imageUrl: img(6) },
        { brandId: getBrandId('Adidas'), name: 'YEEZY Slide Onyx',            description: 'Minimalist luxury foam slide. The streetwear staple for post-workout recovery.',            basePrice: '8499.00',  category: 'Lifestyle',    isNew: false, isOnSale: true,  imageUrl: img(7) },

        // ═══════════════════════════ NEW BALANCE (8) ═══════════════════════
        { brandId: getBrandId('New Balance'), name: 'Made in USA 990v6',      description: 'The standard-bearer of the 990 series. Legendary comfort, made in America.',               basePrice: '19999.00', category: 'Running',      isNew: true,  isOnSale: false, imageUrl: img(0) },
        { brandId: getBrandId('New Balance'), name: '550 White/Green',         description: 'A retro basketball oxford honoring the 1989 original. Tumbled leather.',                   basePrice: '10999.00', category: 'Classic',      isNew: false, isOnSale: true,  imageUrl: img(1) },
        { brandId: getBrandId('New Balance'), name: 'Fresh Foam 1080v13',     description: 'The pinnacle of New Balance cushioning technology. Ultra-plush ride.',                      basePrice: '14999.00', category: 'Running',      isNew: false, isOnSale: false, imageUrl: img(2) },
        { brandId: getBrandId('New Balance'), name: '2002R Protection Pack',  description: 'Deconstructed upper design meets modern performance heritage.',                             basePrice: '15999.00', category: 'Lifestyle',    isNew: false, isOnSale: false, imageUrl: img(3) },
        { brandId: getBrandId('New Balance'), name: '327 Retro Brights',      description: 'A bold, angular redesign of classic 1970s running shoes.',                                  basePrice: '8499.00',  category: 'Lifestyle',    isNew: false, isOnSale: true,  imageUrl: img(4) },
        { brandId: getBrandId('New Balance'), name: '9060 Sea Salt',          description: 'Futuristic silhouette with layered textures and ABZORB midsole cushioning.',                basePrice: '16499.00', category: 'Lifestyle',    isNew: true,  isOnSale: false, imageUrl: img(5) },
        { brandId: getBrandId('New Balance'), name: 'FuelCell SuperComp Elite v4', description: 'Energy-returning carbon plate racer designed for sub-elite marathon runners.',          basePrice: '22999.00', category: 'Running',      isNew: false, isOnSale: false, imageUrl: img(6) },
        { brandId: getBrandId('New Balance'), name: '574 Core Grey',          description: 'The quintessential dad shoe. ENCAP midsole support since 1988.',                             basePrice: '8999.00',  category: 'Classic',      isNew: false, isOnSale: false, imageUrl: img(7) },

        // ═══════════════════════════ PUMA (8) ═══════════════════════════
        { brandId: getBrandId('Puma'), name: 'Suede Classic XXI',             description: 'The original B-boy shoe. Half a century of streetwear royalty.',                             basePrice: '8499.00',  category: 'Classic',      isNew: false, isOnSale: true,  imageUrl: img(0) },
        { brandId: getBrandId('Puma'), name: 'RS-X Reinvention',              description: 'Bold colour-blocking and chunky proportions. The ultimate dad-tech runner.',                 basePrice: '11499.00', category: 'Lifestyle',    isNew: true,  isOnSale: false, imageUrl: img(1) },
        { brandId: getBrandId('Puma'), name: 'Palermo Leather',               description: 'Italian terrace culture meets everyday versatility. Butter-soft leather upper.',              basePrice: '9999.00',  category: 'Classic',      isNew: false, isOnSale: false, imageUrl: img(2) },
        { brandId: getBrandId('Puma'), name: 'MB.03 LaMelo Ball',             description: 'LaMelo\'s signature shoe. Nitro foam and wild colourways for the fearless.',                 basePrice: '14999.00', category: 'Basketball',   isNew: false, isOnSale: true,  imageUrl: img(3) },
        { brandId: getBrandId('Puma'), name: 'Deviate NITRO Elite 2',         description: 'Carbon-plated distance racer with NITRO foam. Sub-3-hour marathon weapon.',                  basePrice: '19999.00', category: 'Running',      isNew: false, isOnSale: false, imageUrl: img(4) },
        { brandId: getBrandId('Puma'), name: 'Clyde All-Pro',                 description: 'On-court heritage meets modern hoops tech. Homage to Walt "Clyde" Frazier.',                 basePrice: '12999.00', category: 'Basketball',   isNew: false, isOnSale: false, imageUrl: img(5) },
        { brandId: getBrandId('Puma'), name: 'Speedcat OG Sparco',            description: 'Born in motorsport. The low-profile driving shoe that became a street icon.',                basePrice: '10999.00', category: 'Lifestyle',    isNew: false, isOnSale: false, imageUrl: img(6) },
        { brandId: getBrandId('Puma'), name: 'PUMA x FENTY Creeper',          description: 'Rihanna\'s punk-luxe platform sneaker. Thick sole, premium suede upper.',                   basePrice: '15999.00', category: 'Exclusive',    isNew: false, isOnSale: false, imageUrl: img(7) },
    ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant generation — 5 sizes × 2 random colours per product
// ─────────────────────────────────────────────────────────────────────────────
const SIZES = ['7', '8', '9', '10', '11'];
const COLOURS = ['Black', 'White', 'Red', 'Grey', 'Blue', 'Cream', 'Green'];

function buildVariants(insertedProducts) {
    const variants = [];

    insertedProducts.forEach((product) => {
        // Pick 2 unique random colours
        const shuffled = [...COLOURS].sort(() => 0.5 - Math.random());
        const productColours = shuffled.slice(0, 2);

        productColours.forEach((colour) => {
            SIZES.forEach((size) => {
                variants.push({
                    productId: product.id,
                    sku: `SKU-${product.id.split('-')[0]}-${colour.toUpperCase().slice(0, 3)}-SZ${size}`,
                    size,
                    color: colour,
                    stock: Math.floor(Math.random() * 25) + 5, // 5–30
                });
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
    await db.delete(products);
    await db.delete(brands);
    await db.delete(users);
    console.log('   Done.\n');

    // ── B. Seed admin user ──
    console.log('👤 Seeding admin user…');
    const [admin] = await db.insert(users).values({
        name: 'Admin User',
        email: 'admin@kixx.com',
        role: 'admin',
        passwordHash: 'firebase_handles_auth_but_required_for_schema',
    }).returning();
    console.log(`   ✅ ${admin.email}\n`);

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
