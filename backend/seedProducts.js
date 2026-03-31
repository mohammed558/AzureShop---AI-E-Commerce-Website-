const productService = require('./services/productService');

const products = [
  {
    "name": "Ultra-Thick Pro Laptop",
    "description": "Silicon valley performance with a 16-inch Retina-style display.",
    "price": 129999,
    "category": "Electronics",
    "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format",
    "rating": 4.8,
    "stock": 10
  },
  {
    "name": "ZenPad 10 Tablet",
    "description": "Portable 10-inch tablet with stunning 4K resolution and stylus support.",
    "price": 45999,
    "category": "Electronics",
    "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format",
    "rating": 4.5,
    "stock": 15
  },
  {
    "name": "SoundWave Max Headphones",
    "description": "Studio-grade over-ear wireless headphones with spatial audio.",
    "price": 24999,
    "category": "Electronics",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format",
    "rating": 4.9,
    "stock": 20
  },
  {
    "name": "PixelPerfect 27 Monitor",
    "description": "Pro-grade 27-inch 144Hz IPS monitor for creators and gamers.",
    "price": 34999,
    "category": "Electronics",
    "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format",
    "rating": 4.7,
    "stock": 8
  },
  {
    "name": "SmartHome Hub Pro",
    "description": "Centralized control for your smart home with 7-inch touchscreen.",
    "price": 12999,
    "category": "Electronics",
    "image": "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format",
    "rating": 4.2,
    "stock": 30
  },
  {
    "name": "CyberCharge Power Bank",
    "description": "30000mAh ultra-fast charging power bank with PD support.",
    "price": 5499,
    "category": "Electronics",
    "image": "https://media.istockphoto.com/id/1126642401/photo/power-bank-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=FMMhXxZql2guHigJvPDsi6S5Bp_QT6OsfZnD6kqcc3U=",
    "rating": 4.4,
    "stock": 50
  },
  {
    "name": "NanoDrone X4",
    "description": "Compact 4K drone with GPS and 30-minute flight time.",
    "price": 39999,
    "category": "Electronics",
    "image": "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format",
    "rating": 4.6,
    "stock": 12
  },
  {
    "name": "VividCam Mirrorless",
    "description": "24.2MP full-frame mirrorless camera for professional photography.",
    "price": 89999,
    "category": "Electronics",
    "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format",
    "rating": 4.8,
    "stock": 5
  },
  {
    "name": "HyperTrack Gaming Mouse",
    "description": "Ultra-lightweight wireless gaming mouse with 26K DPI sensor.",
    "price": 7999,
    "category": "Electronics",
    "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format",
    "rating": 4.5,
    "stock": 40
  },
  {
    "name": "MechKey RGB Keyboard",
    "description": "Mechanical keyboard with brown switches and per-key RGB lighting.",
    "price": 11999,
    "category": "Electronics",
    "image": "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format",
    "rating": 4.7,
    "stock": 18
  },
  {
    "name": "BlueStream USB Mic",
    "description": "Professional USB condenser microphone for podcasting and streaming.",
    "price": 9999,
    "category": "Electronics",
    "image": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format",
    "rating": 4.6,
    "stock": 22
  },
  {
    "name": "SwiftRouter WiFi 6",
    "description": "AX6000 dual-band WiFi 6 router for high-speed home internet.",
    "price": 15999,
    "category": "Electronics",
    "image": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format",
    "rating": 4.4,
    "stock": 14
  },
  {
    "name": "CloudStore 2TB SSD",
    "description": "NVMe M.2 2TB SSD with speeds up to 7400MB/s.",
    "price": 10999,
    "category": "Electronics",
    "image": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80",
    "rating": 4.9,
    "stock": 25
  },
  {
    "name": "BioLife Smart Scale",
    "description": "Bluetooth smart scale with body composition analysis.",
    "price": 3999,
    "category": "Electronics",
    "image": "https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format",
    "rating": 4.1,
    "stock": 35
  },
  {
    "name": "RetroConsole X",
    "description": "Retro gaming console with 50+ built-in classic games.",
    "price": 6999,
    "category": "Electronics",
    "image": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format",
    "rating": 4.3,
    "stock": 10
  },
  {
    "name": "Arctic Parka Jacket",
    "description": "Heavy-duty waterproof parka for extreme cold conditions.",
    "price": 12999,
    "category": "Clothing",
    "image": "https://images.unsplash.com/photo-1515645465-7b60b7242324?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "rating": 4.9,
    "stock": 12
  },
  {
    "name": "Luxe Evening Gown",
    "description": "Elegant silk evening gown for formal events and parties.",
    "price": 15999,
    "category": "Clothing",
    "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "stock": 8
  },
  {
    "name": "Comfort Cloud Slides",
    "description": "Ergonomic slides with memory foam footbeds.",
    "price": 1999,
    "category": "Footwear",
    "image": "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format",
    "rating": 4.1,
    "stock": 100
  },
  {
    "name": "Bamboo Bath Set",
    "description": "Organic bamboo accessory set for a spa-like bathroom.",
    "price": 2999,
    "category": "Home",
    "image": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80",
    "rating": 4.2,
    "stock": 45
  },
  {
    "name": "Premium Wireless Noise-Cancelling Headphones",
    "description": "Experience immersive sound with active noise cancellation, 30-hour battery life, and over-ear cushions.",
    "price": 4999,
    "category": "Electronics",
    "image": "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80",
    "rating": 4.6,
    "stock": 50
  }
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
