import mongoose from 'mongoose';
import slugify from 'slugify';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

const productSchema = new mongoose.Schema(
  {
    productCode: { type: String, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, trim: true },
    shortDescription: { type: String, trim: true },
    description: { type: String },
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    originalPrice: { type: Number, default: 0 },
    costPrice: { type: Number, required: true }, // base/manufacturer price
    currentPrice: { type: Number, required: true }, // sale price
    discountPercentage: { type: Number, default: 0 },
    profitAmount: { type: Number, default: 0 },
    profitMargin: { type: Number, default: 0 }, // percentage
    stock: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Draft',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    brand: { type: String, trim: true },
    sku: { type: String, trim: true },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        alt: { type: String, trim: true },
        order: { type: Number, default: 0 },
      },
    ],
    variants: [
      {
        name: { type: String, trim: true }, // e.g., "Red / Large"
        sku: { type: String, trim: true },
        price: { type: Number },
        stock: { type: Number, default: 0 },
        allowBackorder: { type: Boolean, default: false },
        attributes: [{ key: { type: String, trim: true }, value: { type: String, trim: true } }],
        images: [
          {
            url: { type: String },
            publicId: { type: String },
            alt: { type: String, trim: true },
            order: { type: Number, default: 0 },
          },
        ],
      },
    ],
    isFeatured: { type: Boolean, default: false },
    isExclusive: { type: Boolean, default: false },
    isPromoted: { type: Boolean, default: false },
    displayPriority: { type: Number, default: 999 },
    promotionEndDate: { type: Date },
    topBarTag: { type: String, trim: true },
    trendingScore: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
    purchaseCount: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    ratingSum: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isCustomerFavorite: { type: Boolean, default: false },
    searchKeywords: [{ type: String, trim: true }],
    couponCode: { type: String, trim: true },
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    upsellProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

productSchema.pre('validate', function setDefaults() {
  if (!this.productCode) {
    this.productCode = `PRC-${nanoid()}`;
  }

  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  if (this.isModified('originalPrice') || this.isModified('currentPrice')) {
    const original = Number(this.originalPrice || 0);
    const current = Number(this.currentPrice || 0);
    if (original > 0 && current > 0 && original > current) {
      this.discountPercentage = Number((((original - current) / original) * 100).toFixed(2));
    } else {
      this.discountPercentage = 0;
    }
  }

  if (this.isModified('costPrice') || this.isModified('currentPrice')) {
    const cost = Number(this.costPrice || 0);
    const current = Number(this.currentPrice || 0);
    if (current > 0 && cost >= 0) {
      this.profitAmount = Number((current - cost).toFixed(2));
      this.profitMargin = Number(((current - cost) / current * 100 || 0).toFixed(2));
    }
  }

  if (this.isModified('ratingSum') || this.isModified('ratingCount')) {
    const sum = Number(this.ratingSum || 0);
    const count = Number(this.ratingCount || 0);
    this.averageRating = count > 0 ? Number((sum / count).toFixed(2)) : 0;
    this.reviewCount = count;
  }
});

productSchema.index({ name: 'text', tags: 'text', searchKeywords: 'text', slug: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
