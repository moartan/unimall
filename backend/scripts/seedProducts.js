import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/catalog/Product.js';
import Category from '../src/models/catalog/Category.js';
import config from '../src/config/env.js';

dotenv.config();

const categories = [
  { name: 'Laptops', description: 'Laptops and notebooks', displayOrder: 1 },
  { name: 'Phones', description: 'Smartphones and accessories', displayOrder: 2 },
  { name: 'Audio', description: 'Headphones and speakers', displayOrder: 3 },
];

const products = [
  {
    name: 'NovaBook Air 14',
    shortDescription: 'Lightweight 14-inch laptop for everyday work.',
    description: 'Slim aluminum body, fast SSD, and all-day battery for productivity on the go.',
    brand: 'NovaTech',
    totalCost: 520,
    regularPrice: 799,
    salePrice: 749,
    stock: 35,
    status: 'Published',
    categoryName: 'Laptops',
    isFeatured: true,
    isExclusive: false,
  },
  {
    name: 'Galaxy One Pro',
    shortDescription: 'Flagship 6.7-inch AMOLED phone with triple cameras.',
    description: 'Premium build, fast charging, and top-tier performance for power users.',
    brand: 'SkyMobile',
    totalCost: 480,
    regularPrice: 999,
    salePrice: 899,
    stock: 50,
    status: 'Published',
    categoryName: 'Phones',
    isFeatured: false,
    isExclusive: true,
  },
  {
    name: 'Aurora Buds X',
    shortDescription: 'Wireless earbuds with ANC and 30-hour battery.',
    description: 'Comfortable fit, adaptive noise cancelling, and rich sound in a compact case.',
    brand: 'Aurora Audio',
    totalCost: 60,
    regularPrice: 149,
    salePrice: 129,
    stock: 120,
    status: 'Published',
    categoryName: 'Audio',
    isFeatured: true,
    isExclusive: false,
  },
  {
    name: 'ZenNote 15',
    shortDescription: '15-inch productivity laptop with crisp IPS display.',
    description: 'Great keyboard, lots of ports, and reliable performance for office workflows.',
    brand: 'ZenWorks',
    totalCost: 650,
    regularPrice: 950,
    salePrice: 899,
    stock: 22,
    status: 'Published',
    categoryName: 'Laptops',
    isFeatured: false,
    isExclusive: false,
  },
  {
    name: 'Pulse Mini Speaker',
    shortDescription: 'Pocket-size Bluetooth speaker with punchy sound.',
    description: 'Rugged build, splash resistance, and 12-hour battery for music anywhere.',
    brand: 'Pulse',
    totalCost: 18,
    regularPrice: 49,
    salePrice: 39,
    stock: 200,
    status: 'Published',
    categoryName: 'Audio',
    isFeatured: false,
    isExclusive: false,
  },
];

const run = async () => {
  await mongoose.connect(config.mongoUri);
  console.log('Connected to MongoDB');

  // Seed categories (idempotent on name)
  const categoryMap = new Map();
  for (const cat of categories) {
    const existing = await Category.findOne({ name: cat.name, isDeleted: { $ne: true } });
    if (existing) {
      categoryMap.set(cat.name, existing._id);
      continue;
    }
    const created = await Category.create(cat);
    categoryMap.set(cat.name, created._id);
  }

  // Seed products without images
  for (const prod of products) {
    const categoryId = categoryMap.get(prod.categoryName);
    if (!categoryId) {
      console.warn(`Skipping product ${prod.name}: category ${prod.categoryName} not found`);
      continue;
    }
    await Product.create({
      name: prod.name,
      shortDescription: prod.shortDescription,
      description: prod.description,
      brand: prod.brand,
      totalCost: prod.totalCost,
      regularPrice: prod.regularPrice,
      salePrice: prod.salePrice,
      stock: prod.stock,
      status: prod.status,
      category: categoryId,
      isFeatured: prod.isFeatured,
      isExclusive: prod.isExclusive,
      images: [],
    });
    console.log(`Seeded product: ${prod.name}`);
  }

  await mongoose.disconnect();
  console.log('Seeding complete.');
};

run().catch((err) => {
  console.error('Seeding failed', err);
  mongoose.disconnect();
});
