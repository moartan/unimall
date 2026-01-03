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
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    brand: { type: String, trim: true },
    totalCost: { type: Number, required: true }, // total cost to company
    regularPrice: { type: Number, required: true }, // original price shown to customer
    salePrice: { type: Number, required: true }, // final selling price
    stock: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Draft',
    },
    displayPriority: { type: Number, default: 999 },
    isTrending: { type: Boolean, default: false },
    trendingSort: { type: Number, default: 9999 },
    isFeatured: { type: Boolean, default: false },
    isExclusive: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    purchaseCount: { type: Number, default: 0 },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        alt: { type: String, trim: true },
        order: { type: Number, default: 0 },
      },
    ],
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    publishedAt: { type: Date },
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
});

productSchema.index({ name: 'text', slug: 'text', shortDescription: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
