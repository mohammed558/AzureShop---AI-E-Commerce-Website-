require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const productService = require('./services/productService');

const prisma = new PrismaClient();

const SAMPLE_PRODUCTS = [
  {
    name: 'Premium Wireless Noise-Cancelling Headphones',
    description: 'Experience immersive sound with active noise cancellation, 30-hour battery life, and ultra-comfortable over-ear cushions.',
    price: 4999,
    category: 'Electronics',
    color: 'Black',
    pattern: 'Solid',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000',
    rating: 4.6,
    stock: 50
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Track your workouts, sleep patterns, and heart rate 24/7. Water resistant up to 50m.',
    price: 3499,
    category: 'Electronics',
    color: 'Silver',
    pattern: 'Metal',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000',
    rating: 4.3,
    stock: 120
  },
  {
    name: 'Men\'s Oxford Leather Shoes',
    description: 'Classic genuine leather oxford shoes with hand-stitched detailing. Ideal for formal occasions.',
    price: 2799,
    category: 'Footwear',
    color: 'Brown',
    pattern: 'Leather',
    image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&q=80&w=1000',
    rating: 4.5,
    stock: 30
  },
  {
    name: 'Women\'s Running Shoes',
    description: 'Ultralight running shoes with breathable mesh and responsive foam midsole.',
    price: 1999,
    category: 'Footwear',
    color: 'White',
    pattern: 'Mesh',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000',
    rating: 4.4,
    stock: 80
  },
  {
    name: 'Slim-Fit Cotton Shirt',
    description: 'Premium 100% cotton casual shirt with a modern slim fit. Soft and breathable.',
    price: 1299,
    category: 'Clothing',
    color: 'Blue',
    pattern: 'Striped',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=1000',
    rating: 4.2,
    stock: 200
  }
];

async function migrate() {
  console.log('🚀 Starting migration to PostgreSQL...');
  
  try {
    // 1. Clear existing data in DB (Optional, but good for testing)
    const count = await prisma.product.count();
    if (count > 0) {
      console.log(`🗑️ Clearing ${count} existing products from DB...`);
      await prisma.product.deleteMany();
    }

    // 2. Insert new products and sync to Search
    for (const data of SAMPLE_PRODUCTS) {
      console.log(`📦 Processing: ${data.name}...`);
      await productService.createProduct(data);
    }

    console.log('✅ Migration complete! PostgreSQL and Azure AI Search are in sync.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
