const productService = require('./services/productService');

const products = [
  // --- Electronics (15) - Tech Products with matching images ---
  { name: "Ultra-Thick Pro Laptop", description: "Silicon valley performance with a 16-inch Retina-style display.", price: 129999, category: "Electronics", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80", rating: 4.8 },
  { name: "ZenPad 10 Tablet", description: "Portable 10-inch tablet with stunning 4K resolution and stylus support.", price: 45999, category: "Electronics", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80", rating: 4.5 },
  { name: "SoundWave Max Headphones", description: "Studio-grade over-ear wireless headphones with spatial audio.", price: 24999, category: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80", rating: 4.9 },
  { name: "PixelPerfect 27 Monitor", description: "Pro-grade 27-inch 144Hz IPS monitor for creators and gamers.", price: 34999, category: "Electronics", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80", rating: 4.7 },
  { name: "SmartHome Hub Pro", description: "Centralized control for your smart home with 7-inch touchscreen.", price: 12999, category: "Electronics", image: "https://images.unsplash.com/photo-1558002038-103792e07174?auto=format&fit=crop&w=600&q=80", rating: 4.2 },
  { name: "CyberCharge Power Bank", description: "30000mAh ultra-fast charging power bank with PD support.", price: 5499, category: "Electronics", image: "https://images.unsplash.com/photo-1609592424109-dd9892f1b17c?auto=format&fit=crop&w=600&q=80", rating: 4.4 },
  { name: "NanoDrone X4", description: "Compact 4K drone with GPS and 30-minute flight time.", price: 39999, category: "Electronics", image: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=600&q=80", rating: 4.6 },
  { name: "VividCam Mirrorless", description: "24.2MP full-frame mirrorless camera for professional photography.", price: 89999, category: "Electronics", image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?auto=format&fit=crop&w=600&q=80", rating: 4.8 },
  { name: "HyperTrack Gaming Mouse", description: "Ultra-lightweight wireless gaming mouse with 26K DPI sensor.", price: 7999, category: "Electronics", image: "https://images.unsplash.com/photo-1587829191301-76ec2b300111?auto=format&fit=crop&w=600&q=80", rating: 4.5 },
  { name: "MechKey RGB Keyboard", description: "Mechanical keyboard with brown switches and per-key RGB lighting.", price: 11999, category: "Electronics", image: "https://images.unsplash.com/photo-1587829191301-76ec2b300111?auto=format&fit=crop&w=600&q=80", rating: 4.7 },
  { name: "BlueStream USB Mic", description: "Professional USB condenser microphone for podcasting and streaming.", price: 9999, category: "Electronics", image: "https://images.unsplash.com/photo-1599669786438-e53955d89117?auto=format&fit=crop&w=600&q=80", rating: 4.6 },
  { name: "SwiftRouter WiFi 6", description: "AX6000 dual-band WiFi 6 router for high-speed home internet.", price: 15999, category: "Electronics", image: "https://images.unsplash.com/photo-1581589344861-8a4d3d72e5e9?auto=format&fit=crop&w=600&q=80", rating: 4.4 },
  { name: "CloudStore 2TB SSD", description: "NVMe M.2 2TB SSD with speeds up to 7400MB/s.", price: 10999, category: "Electronics", image: "https://images.unsplash.com/photo-1597872200370-493dee2474a1?auto=format&fit=crop&w=600&q=80", rating: 4.9 },
  { name: "BioLife Smart Scale", description: "Bluetooth smart scale with body composition analysis.", price: 3999, category: "Electronics", image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&w=600&q=80", rating: 4.1 },
  { name: "RetroConsole X", description: "Retro gaming console with 50+ built-in classic games.", price: 6999, category: "Electronics", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80", rating: 4.3 },

  // --- Clothing (15) - Fashion apparel with matching images ---
  { name: "Arctic Parka Jacket", description: "Heavy-duty waterproof parka for extreme cold conditions.", price: 12999, category: "Clothing", image: "https://images.unsplash.com/photo-1539533377285-b9aa3c0defd4?auto=format&fit=crop&w=600&q=80", rating: 4.9 },
  { name: "Classic Denim Jacket", description: "Timeless indigo denim jacket with a vintage wash.", price: 4499, category: "Clothing", image: "https://images.unsplash.com/photo-1551028719-00167b16ebc5?auto=format&fit=crop&w=600&q=80", rating: 4.6 },
  { name: "Merino Wool Sweater", description: "Soft and breathable 100% merino wool sweater for everyday wear.", price: 3599, category: "Clothing", image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=600&q=80", rating: 4.7 },
  { name: "Luxe Evening Gown", description: "Elegant silk evening gown for formal events and parties.", price: 15999, category: "Clothing", image: "https://images.unsplash.com/photo-1595777707802-221658ef0427?auto=format&fit=crop&w=600&q=80", rating: 4.8 },
  { name: "Slim-Fit Chinos", description: "Versatile stretch cotton chinos in a modern slim fit.", price: 2999, category: "Clothing", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80", rating: 4.5 },
  { name: "Performance Tech T-Shirt", description: "Moisture-wicking athletic t-shirt for high-intensity training.", price: 1499, category: "Clothing", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80", rating: 4.4 },
  { name: "Urban Cargo Pants", description: "Rugged cargo pants with multiple utility pockets.", price: 3999, category: "Clothing", image: "https://images.unsplash.com/photo-1565084888279-aff9969bb048?auto=format&fit=crop&w=600&q=80", rating: 4.3 },
  { name: "Floral Summer Dress", description: "Lightweight rayon dress with a bright floral print.", price: 2499, category: "Clothing", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80", rating: 4.6 },
  { name: "Oversized Velvet Hoodie", description: "Cozy velvet hoodie with a relaxed, modern silhouette.", price: 3499, category: "Clothing", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80", rating: 4.2 },
  { name: "Professional Tailored Blazer", description: "Classic black blazer for a polished professional look.", price: 8999, category: "Clothing", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80", rating: 4.7 },
  { name: "Sustainable Hemp Tee", description: "Eco-friendly t-shirt made from organic hemp and cotton.", price: 1999, category: "Clothing", image: "https://images.unsplash.com/photo-1618354691551-418cb50493e5?auto=format&fit=crop&w=600&q=80", rating: 4.5 },
  { name: "Knitted Cardigan", description: "Warm oversized cardigan with cable knit detailing.", price: 4299, category: "Clothing", image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80", rating: 4.4 },
  { name: "Wide-Leg Trousers", description: "High-waisted wide-leg trousers in a flowy fabric.", price: 3299, category: "Clothing", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80", rating: 4.6 },
  { name: "Bomber Flight Jacket", description: "Sleek nylon bomber jacket with pocket detailing.", price: 5999, category: "Clothing", image: "https://images.unsplash.com/photo-1559345604-6a79fdd18e6e?auto=format&fit=crop&w=600&q=80", rating: 4.5 },
  { name: "Boho Maxi Skirt", description: "Full-length printed maxi skirt for a bohemian vibe.", price: 2799, category: "Clothing", image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=600&q=80", rating: 4.3 },

  // --- Footwear (15) - Shoes with matching images ---
  { name: "Apex Trail Runner", description: "Highly durable trail running shoes with superior traction.", price: 8999, category: "Footwear", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80", rating: 4.8 },
  { name: "Urban Leather Boots", description: "Water-resistant leather boots for city exploration.", price: 11999, category: "Footwear", image: "https://images.unsplash.com/photo-1572272481851-59daddc06593?auto=format&fit=crop&w=600&q=80", rating: 4.7 },
  { name: "Swift Court Shoes", description: "Lightweight tennis shoes with responsive cushioning.", price: 7499, category: "Footwear", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80", rating: 4.5 },
  { name: "Elite Soccer Cleats", description: "Professional-grade cleats for maximum ball control.", price: 14999, category: "Footwear", image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&q=80", rating: 4.9 },
  { name: "Casual Canvas Sneakers", description: "Comfortable everyday sneakers in versatile grey.", price: 3599, category: "Footwear", image: "https://images.unsplash.com/photo-1525966222d34-24b581144c8b?auto=format&fit=crop&w=600&q=80", rating: 4.2 },
  { name: "Luxe Suede Loafers", description: "Handcrafted suede loafers for sophisticated style.", price: 9999, category: "Footwear", image: "https://images.unsplash.com/photo-1449241743088-ca997ec5167b?auto=format&fit=crop&w=600&q=80", rating: 4.6 },
  { name: "Comfort Cloud Slides", description: "Ergonomic slides with memory foam footbeds.", price: 1999, category: "Footwear", image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=600&q=80", rating: 4.1 },
  { name: "Rugged Hiking Boots", description: "Ankle-support hiking boots with Vibram outsoles.", price: 13999, category: "Footwear", image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80", rating: 4.8 },
  { name: "Classic Ballet Flats", description: "Elegant leather ballet flats for any occasion.", price: 4999, category: "Footwear", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80", rating: 4.4 },
  { name: "Modern Ankle Sneakers", description: "Futuristic high-top sneakers with sleek lines.", price: 8499, category: "Footwear", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80", rating: 4.5 },
  { name: "Espadrille Wedges", description: "Summer-ready wedge sandals with rope detailing.", price: 5499, category: "Footwear", image: "https://images.unsplash.com/photo-1609861363536-ba82154764cb?auto=format&fit=crop&w=600&q=80", rating: 4.3 },
  { name: "Grand Tour Oxfords", description: "Premium leather oxfords for formal and business wear.", price: 10999, category: "Footwear", image: "https://images.unsplash.com/photo-1507019647281-468f3402b925?auto=format&fit=crop&w=600&q=80", rating: 4.7 },
  { name: "Neon Flux Runners", description: "Vibrant high-performance running shoes with glow accents.", price: 9499, category: "Footwear", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80", rating: 4.6 },
  { name: "Beach Flip Flops", description: "Durable rubber flip flops for poolside comfort.", price: 999, category: "Footwear", image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=600&q=80", rating: 3.9 },
  { name: "Timberland Style Boots", description: "Classic wheat-colored work boots for tough style.", price: 12499, category: "Footwear", image: "https://images.unsplash.com/photo-1572272481851-59daddc06593?auto=format&fit=crop&w=600&q=80", rating: 4.8 },

  // --- Home & Gifts (10) - Interior with matching images ---
  { name: "Nordic Minimalist Lamp", description: "Sleek wooden floor lamp with soft ambient lighting.", price: 7999, category: "Home", image: "https://images.unsplash.com/photo-1565636192335-14f0112413f3?auto=format&fit=crop&w=600&q=80", rating: 4.7 },
  { name: "Ceramic Coffee Set", description: "Hand-glazed 6-piece ceramic coffee mug set.", price: 2499, category: "Home", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80", rating: 4.5 },
  { name: "Velvet Throw Pillow", description: "Luxurious deep emerald velvet pillow for home decor.", price: 1299, category: "Home", image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80", rating: 4.4 },
  { name: "Aromatherapy Diffuser", description: "Ultrasonic essential oil diffuser with LED mood lights.", price: 3499, category: "Home", image: "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=600&q=80", rating: 4.3 },
  { name: "Cast Iron Dutch Oven", description: "Heavy-duty 5-quart enameled cast iron pot.", price: 6599, category: "Home", image: "https://images.unsplash.com/photo-1591261730799-ee4e6c2d16d7?auto=format&fit=crop&w=600&q=80", rating: 4.9 },
  { name: "Bamboo Bath Set", description: "Organic bamboo accessory set for a spa-like bathroom.", price: 2999, category: "Home", image: "https://images.unsplash.com/photo-1600585154340-be6191ecdb5d?auto=format&fit=crop&w=600&q=80", rating: 4.2 },
  { name: "Abstract Canvas Art", description: "Modern hand-painted abstract canvas for wall decoration.", price: 8999, category: "Home", image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80", rating: 4.8 },
  { name: "Smart Herb Garden", description: "Indoor hydroponic system for growing fresh herbs.", price: 11999, category: "Home", image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80", rating: 4.6 },
  { name: "Linen Bedding Set", description: "Breathable 100% French linen duvet cover and shams.", price: 12999, category: "Home", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80", rating: 4.7 },
  { name: "Marble Serving Board", description: "Natural white marble board with gold-tone handles.", price: 4499, category: "Home", image: "https://images.unsplash.com/photo-1600166896344-055939202edc?auto=format&fit=crop&w=600&q=80", rating: 4.5 },

  // --- Accessories (10) - Premium accessories & jewelry ---
  { name: "Silk Pashmina Scarf", description: "Luxurious hand-woven silk pashmina in rich jewel tones.", price: 8999, category: "Accessories", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80", rating: 4.8 },
  { name: "Leather Crossbody Bag", description: "Genuine Italian leather crossbody with adjustable strap.", price: 14999, category: "Accessories", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80", rating: 4.7 },
  { name: "Vintage Gold Watch", description: "Timeless automatic watch with sapphire crystal and leather band.", price: 34999, category: "Accessories", image: "https://images.unsplash.com/photo-1523170335684-f042f1f86e69?auto=format&fit=crop&w=600&q=80", rating: 4.9 },
  { name: "Pearl Necklace", description: "Elegant freshwater pearl necklace on 14K gold chain.", price: 12999, category: "Accessories", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80", rating: 4.8 },
  { name: "Leather Belt", description: "Premium leather belt with brushed gold buckle.", price: 4999, category: "Accessories", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80", rating: 4.6 },
  { name: "Silk Pocket Square", description: "Hand-printed silk pocket square for the discerning gentleman.", price: 1999, category: "Accessories", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80", rating: 4.4 },
  { name: "Diamond Stud Earrings", description: "Certified VS1 diamond studs in 18K white gold settings.", price: 89999, category: "Accessories", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80", rating: 4.9 },
  { name: "Cashmere Gloves", description: "Buttery soft 100% cashmere gloves lined with silk.", price: 5999, category: "Accessories", image: "https://images.unsplash.com/photo-1471879832106-c7ab9019e8de?auto=format&fit=crop&w=600&q=80", rating: 4.7 },
  { name: "Designer Sunglasses", description: "Luxury oversized sunglasses with UV protection and case.", price: 19999, category: "Accessories", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80", rating: 4.8 },
  { name: "Silk Hair Scarf", description: "Gentle on hair, prevents breakage and frizz while sleeping.", price: 2999, category: "Accessories", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80", rating: 4.5 }
];

async function seed() {
  console.log(`🚀 Starting bulk seed of ${products.length} products...`);
  let successCount = 0;
  let failCount = 0;

  for (const product of products) {
    try {
      console.log(`📦 Seeding: "${product.name}"...`);
      await productService.createProduct(product);
      successCount++;
      // Sleep slightly to avoid overwhelming rate limits during seeding
      await new Promise(r => setTimeout(r, 200)); 
    } catch (err) {
      console.error(`❌ Failed to seed "${product.name}":`, err.message);
      failCount++;
    }
  }

  console.log("\n--- Seeding Complete ---");
  console.log(`✅ Successfully seeded: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  process.exit(0);
}

seed();
