import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/catalog/Product.js';
import Category from '../src/models/catalog/Category.js';
import config from '../src/config/env.js';

dotenv.config();

const categoriesSeed = [
  { name: 'Camera', description: 'Cameras and creator gear', displayOrder: 1 },
  { name: 'Tablet', description: 'Tablets and productivity devices', displayOrder: 2 },
  { name: 'Audio', description: 'Headphones, earbuds, and speakers', displayOrder: 3 },
  { name: 'Laptop', description: 'Laptops and ultrabooks', displayOrder: 4 },
  { name: 'Watch', description: 'Smartwatches and wearables', displayOrder: 5 },
  { name: 'Mobile', description: 'Smartphones and accessories', displayOrder: 6 },
];

const productsSeed = [
  {
    name: 'Canon EOS R6 Mark II',
    shortDescription: 'Full-frame hybrid camera with advanced AF and 4K60 recording.',
    description: 'The Canon EOS R6 Mark II offers 4K60 oversampled video, class-leading autofocus, and high-speed burst shooting for hybrid creators.',
    brand: 'Canon',
    currentPrice: 2499,
    originalPrice: 2699,
    costPrice: 1800,
    stock: 20,
    status: 'Published',
    categoryName: 'Camera',
    tags: ['canon', 'mirrorless', 'full-frame'],
    searchKeywords: ['canon', 'r6 mark ii', 'mirrorless'],
    images: [
      { url: 'https://images.unsplash.com/photo-1612817288484-6ad773b8c4e0?auto=format&fit=crop&w=900&q=80', alt: 'Canon EOS R6 front' },
      { url: 'https://images.unsplash.com/photo-1604066867776-643725b0a43d?auto=format&fit=crop&w=900&q=80', alt: 'Canon camera top' },
      { url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80', alt: 'Canon lens close-up' },
      { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80', alt: 'Canon product lifestyle' }
    ]
  },

  {
    name: 'Samsung Galaxy Tab S10 FE',
    shortDescription: 'Affordable large-screen tablet with S Pen support.',
    description: 'Galaxy Tab S10 FE combines a vibrant LCD display, S Pen input, and long battery life at a budget-friendly price point.',
    brand: 'Samsung',
    currentPrice: 499,
    originalPrice: 549,
    costPrice: 360,
    stock: 40,
    status: 'Published',
    categoryName: 'Tablet',
    tags: ['tablet', 'android', 's pen'],
    searchKeywords: ['tab s10 fe', 'samsung tablet'],
    images: [
      { url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=900&q=80', alt: 'Samsung tablet front' },
      { url: 'https://images.unsplash.com/photo-1583224909300-42dd2350140d?auto=format&fit=crop&w=900&q=80', alt: 'Tablet desk setup' },
      { url: 'https://images.unsplash.com/photo-1598327106026-d9521da673d6?auto=format&fit=crop&w=900&q=80', alt: 'Tablet with stylus' },
      { url: 'https://images.unsplash.com/photo-1559163499-868a8e58f3d6?auto=format&fit=crop&w=900&q=80', alt: 'Tablet on workspace' }
    ]
  },

  {
    name: 'Bose SoundLink Max',
    shortDescription: 'Portable Bluetooth speaker with deep bass and rugged build.',
    description: 'SoundLink Max provides powerful sound, long battery life, and a rugged design ideal for both indoor and outdoor listening.',
    brand: 'Bose',
    currentPrice: 299,
    originalPrice: 349,
    costPrice: 200,
    stock: 35,
    status: 'Published',
    categoryName: 'Audio',
    tags: ['bluetooth speaker', 'portable', 'bose'],
    searchKeywords: ['bose speaker', 'soundlink max'],
    images: [
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80', alt: 'Bose speaker' },
      { url: 'https://images.unsplash.com/photo-1581291518654-8640cf159a72?auto=format&fit=crop&w=900&q=80', alt: 'Speaker on desk' },
      { url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80', alt: 'Portable speaker' },
      { url: 'https://images.unsplash.com/photo-1593697820675-21ec1d345b56?auto=format&fit=crop&w=900&q=80', alt: 'Outdoor speaker use' }
    ]
  },

  {
    name: 'ASUS ZenBook Pro 16X OLED',
    shortDescription: 'Creator laptop with OLED display and advanced cooling.',
    description: 'ZenBook Pro 16X OLED features a high-end OLED panel, RTX graphics, a tilting keyboard deck, and a premium CNC chassis.',
    brand: 'ASUS',
    currentPrice: 2599,
    originalPrice: 2799,
    costPrice: 2000,
    stock: 14,
    status: 'Published',
    categoryName: 'Laptop',
    tags: ['asus', 'creator laptop', 'oled'],
    searchKeywords: ['zenbook pro', 'asus laptop', 'oled 16'],
    images: [
      { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80', alt: 'Laptop open' },
      { url: 'https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=900&q=80', alt: 'Laptop keyboard close-up' },
      { url: 'https://images.unsplash.com/photo-1527443224154-d19e9af1a672?auto=format&fit=crop&w=900&q=80', alt: 'Laptop workspace' },
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80', alt: 'Laptop side profile' }
    ]
  },

  {
    name: 'Apple Watch Series 10',
    shortDescription: 'Latest-generation smartwatch with advanced health sensors.',
    description: 'Apple Watch Series 10 offers improved battery life, enhanced health monitoring, crash detection, and a brighter always-on display.',
    brand: 'Apple',
    currentPrice: 499,
    originalPrice: 549,
    costPrice: 320,
    stock: 28,
    status: 'Published',
    categoryName: 'Watch',
    tags: ['apple watch', 'health', 'smartwatch'],
    searchKeywords: ['apple watch 10', 'smartwatch'],
    images: [
      { url: 'https://images.unsplash.com/photo-1518441902117-f9ce42f68f29?auto=format&fit=crop&w=900&q=80', alt: 'Apple Watch close-up' },
      { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80', alt: 'Apple Watch on wrist' },
      { url: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80', alt: 'Watch with straps' },
      { url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=900&q=80', alt: 'Apple Watch display' }
    ]
  },

  {
    name: 'Xiaomi 15 Ultra',
    shortDescription: 'Ultra-premium smartphone with Leica optics.',
    description: 'The Xiaomi 15 Ultra features a flagship Snapdragon chipset, quad Leica-tuned cameras, and a stunning AMOLED LTPO display.',
    brand: 'Xiaomi',
    currentPrice: 1299,
    originalPrice: 1399,
    costPrice: 900,
    stock: 30,
    status: 'Published',
    categoryName: 'Mobile',
    tags: ['xiaomi', 'leica', 'flagship'],
    searchKeywords: ['xiaomi 15 ultra', 'leica phone'],
    images: [
      { url: 'https://images.unsplash.com/photo-1512499617640-c2f999098c01?auto=format&fit=crop&w=900&q=80', alt: 'Xiaomi smartphone back' },
      { url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=900&q=80', alt: 'Mobile phone lifestyle' },
      { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80', alt: 'Phone flatlay' },
      { url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80', alt: 'Phone on desk' }
    ]
  },

  {
    name: 'Nikon Zf Retro Edition',
    shortDescription: 'Full-frame retro-style camera with modern performance.',
    description: 'The Nikon Zf blends retro design with advanced Z-mount optics, fast autofocus, and 4K video capabilities.',
    brand: 'Nikon',
    currentPrice: 2299,
    originalPrice: 2399,
    costPrice: 1700,
    stock: 18,
    status: 'Published',
    categoryName: 'Camera',
    tags: ['nikon', 'retro camera', 'full-frame'],
    searchKeywords: ['nikon zf', 'mirrorless retro'],
    images: [
      { url: 'https://images.unsplash.com/photo-1535043325259-9b5f07872ff6?auto=format&fit=crop&w=900&q=80', alt: 'Nikon retro camera' },
      { url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80', alt: 'Nikon lens close-up' },
      { url: 'https://images.unsplash.com/photo-1518562180175-34a163b1a1b1?auto=format&fit=crop&w=900&q=80', alt: 'Camera flatlay' },
      { url: 'https://images.unsplash.com/photo-1504274066651-8d31a536b11a?auto=format&fit=crop&w=900&q=80', alt: 'Vintage camera style' }
    ]
  },

  {
    name: 'Lenovo Legion Slim 7',
    shortDescription: 'Slim gaming laptop with RTX graphics and 165Hz display.',
    description: 'Legion Slim 7 delivers powerful gaming performance in a portable design, featuring RTX graphics and a fast 165Hz panel.',
    brand: 'Lenovo',
    currentPrice: 1899,
    originalPrice: 1999,
    costPrice: 1400,
    stock: 22,
    status: 'Published',
    categoryName: 'Laptop',
    tags: ['gaming', 'lenovo', 'rtx'],
    searchKeywords: ['legion slim 7', 'gaming laptop'],
    images: [
      { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80', alt: 'Gaming laptop' },
      { url: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80', alt: 'Laptop profile' },
      { url: 'https://images.unsplash.com/photo-1559163499-2a5c600ab8b0?auto=format&fit=crop&w=900&q=80', alt: 'Laptop with RGB keyboard' },
      { url: 'https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=900&q=80', alt: 'Laptop desk setup' }
    ]
  },

  {
    name: 'Sony LinkBuds S2',
    shortDescription: 'Ultra-light earbuds with adaptive sound and Hi-Res audio.',
    description: 'LinkBuds S2 offer immersive Hi-Res audio, ANC, and seamless transparency modes for everyday use.',
    brand: 'Sony',
    currentPrice: 199,
    originalPrice: 229,
    costPrice: 130,
    stock: 50,
    status: 'Published',
    categoryName: 'Audio',
    tags: ['sony', 'earbuds', 'anc'],
    searchKeywords: ['linkbuds s2', 'sony earbuds'],
    images: [
      { url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a3af?auto=format&fit=crop&w=900&q=80', alt: 'Sony earbuds' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80', alt: 'Earbuds close-up' },
      { url: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80', alt: 'Earbuds profile' },
      { url: 'https://images.unsplash.com/photo-1499084732479-de2c02d45fcc?auto=format&fit=crop&w=900&q=80', alt: 'Earbuds lifestyle' }
    ]
  },

  {
    name: 'Garmin Forerunner 975',
    shortDescription: 'Advanced GPS running watch with dual-band tracking.',
    description: 'Forerunner 975 enhances training metrics, adds dual-band GPS, improved battery, and deeper performance insights.',
    brand: 'Garmin',
    currentPrice: 599,
    originalPrice: 649,
    costPrice: 380,
    stock: 34,
    status: 'Published',
    categoryName: 'Watch',
    tags: ['running', 'gps', 'training'],
    searchKeywords: ['forerunner 975', 'garmin watch'],
    images: [
      { url: 'https://images.unsplash.com/photo-1518182170549-025f8b85aa47?auto=format&fit=crop&w=900&q=80', alt: 'Garmin watch front' },
      { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80', alt: 'Smartwatch on wrist' },
      { url: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80', alt: 'GPS watch side' },
      { url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80', alt: 'Lifestyle watch photo' }
    ]
  }
]

const connectDb = async () => {
  await mongoose.connect(config.mongoUri);
  console.log('Connected to MongoDB');
};

const upsertCategories = async () => {
  const map = {};
  for (const cat of categoriesSeed) {
    const existing = await Category.findOne({ name: cat.name, isDeleted: { $ne: true } });
    if (existing) {
      map[cat.name] = existing._id;
      continue;
    }
    const created = await Category.create(cat);
    map[cat.name] = created._id;
  }
  return map;
};

const seedProducts = async () => {
  await connectDb();
  const categoryMap = await upsertCategories();

  for (const item of productsSeed) {
    const category = categoryMap[item.categoryName];
    if (!category) {
      console.warn(`Skipping ${item.name}: category ${item.categoryName} not found`);
      continue;
    }
    const payload = {
      ...item,
      category,
      sku: item.sku || `SKU-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      images: (item.images || []).map((img, idx) => ({
        url: img.url,
        alt: img.alt || '',
        order: idx,
      })),
    };
    const existing = await Product.findOne({ name: item.name, isDeleted: { $ne: true } });
    if (existing) {
      existing.set(payload);
      await existing.save();
      console.log(`Updated product: ${item.name}`);
    } else {
      await Product.create(payload);
      console.log(`Created product: ${item.name}`);
    }
  }
  console.log('Seed complete');
  await mongoose.disconnect();
};

seedProducts().catch((err) => {
  console.error(err);
  mongoose.disconnect();
  process.exit(1);
});
