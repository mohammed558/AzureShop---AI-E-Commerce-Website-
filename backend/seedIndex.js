require('dotenv').config();
const { SearchClient, AzureKeyCredential } = require('@azure/search-documents');

const ENDPOINT   = process.env.AZURE_SEARCH_ENDPOINT;
const API_KEY    = process.env.AZURE_SEARCH_API_KEY;
const INDEX_NAME = process.env.AZURE_SEARCH_INDEX_NAME;

const credential    = new AzureKeyCredential(API_KEY);
const searchClient  = new SearchClient(ENDPOINT, INDEX_NAME, credential);

const PRODUCTS = [
  {
    id: '1',
    name: 'Premium Wireless Noise-Cancelling Headphones',
    description: 'Experience immersive sound with active noise cancellation, 30-hour battery life, and ultra-comfortable over-ear cushions. Perfect for music lovers, commuters, and remote workers who need focus.',
    price: 4999,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    rating: 4.6,
    reviewCount: 342,
  },
  {
    id: '2',
    name: 'Smart Fitness Watch with Heart Rate Monitor',
    description: 'Track your workouts, sleep patterns, and heart rate 24/7. Features GPS tracking, water resistance up to 50m, and a bright AMOLED display. Compatible with Android and iOS.',
    price: 3499,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    rating: 4.3,
    reviewCount: 218,
  },
  {
    id: '3',
    name: 'Men\'s Formal Leather Oxford Shoes',
    description: 'Classic genuine leather oxford shoes with hand-stitched detailing. Ideal for weddings, office wear, and formal occasions. Cushioned insole for all-day comfort.',
    price: 2799,
    category: 'Footwear',
    imageUrl: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400',
    rating: 4.5,
    reviewCount: 156,
  },
  {
    id: '4',
    name: 'Women\'s Running Shoes - Ultralight',
    description: 'Engineered mesh upper for breathability and lightweight comfort. Responsive foam midsole absorbs impact. Great for daily runs, gym sessions, and casual wear.',
    price: 1999,
    category: 'Footwear',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    rating: 4.4,
    reviewCount: 289,
  },
  {
    id: '5',
    name: 'Slim-Fit Cotton Casual Shirt',
    description: 'Premium 100% cotton casual shirt with a modern slim fit. Soft, breathable fabric with wrinkle-resistant finish. Available in multiple colors for everyday style.',
    price: 1299,
    category: 'Clothing',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
    rating: 4.2,
    reviewCount: 174,
  },
  {
    id: '6',
    name: 'Women\'s Embroidered Ethnic Kurta Set',
    description: 'Beautiful hand-embroidered kurta with matching palazzo pants. Made from soft rayon fabric, perfect for festive occasions, pujas, and casual ethnic wear.',
    price: 1599,
    category: 'Clothing',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
    rating: 4.7,
    reviewCount: 421,
  },
  {
    id: '7',
    name: 'Budget Laptop - 15.6" Full HD Display',
    description: 'Affordable laptop with Intel i5 processor, 8GB RAM, 512GB SSD, and a 15.6 inch Full HD IPS display. Perfect for students, office work, and light gaming.',
    price: 34999,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    rating: 4.1,
    reviewCount: 532,
  },
  {
    id: '8',
    name: 'Stainless Steel Water Bottle - 1 Litre',
    description: 'Double-wall vacuum insulated bottle keeps drinks cold for 24 hours or hot for 12 hours. BPA-free, leak-proof lid, eco-friendly alternative to plastic bottles.',
    price: 699,
    category: 'Home & Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
    rating: 4.5,
    reviewCount: 876,
  },
  {
    id: '9',
    name: 'Ceramic Non-Stick Cookware Set (5 Pieces)',
    description: 'Premium ceramic-coated cookware set including frying pan, saucepan, kadhai, tawa, and a casserole. PFOA-free, works on gas and induction cooktops.',
    price: 2499,
    category: 'Home & Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    rating: 4.3,
    reviewCount: 198,
  },
  {
    id: '10',
    name: 'Bluetooth Portable Speaker - Waterproof',
    description: 'Compact and rugged Bluetooth speaker with 360-degree sound. IPX7 waterproof rating, 16-hour battery, and built-in microphone for hands-free calls. Ideal for outdoors and travel.',
    price: 1799,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
    rating: 4.4,
    reviewCount: 305,
  },
  {
    id: '11',
    name: 'Men\'s Denim Jacket - Classic Fit',
    description: 'Timeless denim jacket crafted from premium stretch denim. Features button-front closure, chest pockets, and adjustable cuffs. A wardrobe essential for layering.',
    price: 1899,
    category: 'Clothing',
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400',
    rating: 4.3,
    reviewCount: 142,
  },
  {
    id: '12',
    name: 'Women\'s Bridal Wedding Heels - Gold',
    description: 'Elegant gold-toned block heels with intricate stone embellishments. Padded footbed for comfort during long wedding celebrations. Ideal for brides and wedding guests.',
    price: 2299,
    category: 'Footwear',
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400',
    rating: 4.6,
    reviewCount: 97,
  },
  {
    id: '13',
    name: 'Ergonomic Office Chair - Mesh Back',
    description: 'Adjustable lumbar support, breathable mesh back, and padded armrests. Height-adjustable with 360-degree swivel. Designed for long hours of comfortable sitting.',
    price: 8999,
    category: 'Furniture',
    imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400',
    rating: 4.4,
    reviewCount: 267,
  },
  {
    id: '14',
    name: 'Kids\' Educational Tablet - 7 inch',
    description: 'Child-safe tablet with parental controls, pre-loaded educational apps, and a durable shockproof case. 7-inch display with eye-care mode. Perfect for children ages 3-10.',
    price: 5999,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
    rating: 4.0,
    reviewCount: 185,
  },
  {
    id: '15',
    name: 'Organic Green Tea - 100 Tea Bags',
    description: 'Premium whole-leaf green tea sourced from Darjeeling estates. Rich in antioxidants, aids digestion, and boosts metabolism. Packaged in biodegradable tea bags.',
    price: 399,
    category: 'Grocery',
    imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400',
    rating: 4.5,
    reviewCount: 1023,
  },
  {
    id: '16',
    name: 'Backpack - 40L Travel & Hiking',
    description: 'Spacious 40-litre backpack with multiple compartments, padded laptop sleeve, and rain cover. Ergonomic shoulder straps and back panel. Built for travel, hiking, and daily commute.',
    price: 1499,
    category: 'Bags & Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    rating: 4.3,
    reviewCount: 410,
  },
  {
    id: '17',
    name: 'Wireless Charging Pad - Fast Charge',
    description: 'Qi-certified wireless charger with 15W fast charging. Compatible with all Qi-enabled smartphones. Slim design with LED indicator and anti-slip surface.',
    price: 799,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1615526675159-e248c68ef9ce?w=400',
    rating: 4.2,
    reviewCount: 564,
  },
  {
    id: '18',
    name: 'Cotton Bedsheet Set - King Size',
    description: '300 thread-count 100% cotton bedsheet with two pillow covers. Soft, breathable, and machine-washable. Beautiful floral print in soothing pastel colors.',
    price: 1199,
    category: 'Home & Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
    rating: 4.4,
    reviewCount: 328,
  },
  {
    id: '19',
    name: 'Gaming Mouse - RGB, 16000 DPI',
    description: 'High-precision gaming mouse with 16000 DPI optical sensor, 7 programmable buttons, and customizable RGB lighting. Lightweight ergonomic design for competitive gaming.',
    price: 1299,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
    rating: 4.5,
    reviewCount: 445,
  },
  {
    id: '20',
    name: 'Yoga Mat - Premium Non-Slip, 6mm',
    description: 'Extra-thick 6mm yoga mat with superior grip and cushioning. Made from eco-friendly TPE material. Includes carrying strap. Perfect for yoga, pilates, and floor exercises.',
    price: 899,
    category: 'Sports & Fitness',
    imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
    rating: 4.6,
    reviewCount: 612,
  },
];

async function seed() {
  console.log(`📦 Uploading ${PRODUCTS.length} products to index "${INDEX_NAME}"…`);

  try {
    const batch = await searchClient.uploadDocuments(PRODUCTS);
    const succeeded = batch.results.filter(r => r.succeeded).length;
    const failed    = batch.results.filter(r => !r.succeeded).length;

    console.log(`✅ Upload complete — ${succeeded} succeeded, ${failed} failed`);

    if (failed > 0) {
      batch.results
        .filter(r => !r.succeeded)
        .forEach(r => console.error(`   ❌ ${r.key}: ${r.errorMessage}`));
    }
  } catch (err) {
    console.error('❌ Failed to upload products:', err.message);
    process.exit(1);
  }

  console.log('\n🎉 Done! Your products-index is now populated.');
  console.log('   Try: http://localhost:8080/api/products');
}

seed();
