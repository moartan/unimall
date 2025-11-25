import mongoose from 'mongoose';
import slugify from 'slugify';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

const categorySchema = new mongoose.Schema(
  {
    categoryCode: { type: String, unique: true, trim: true },
    name: { type: String, unique: true, required: true, trim: true },
    slug: { type: String, unique: true, trim: true },
    description: { type: String, trim: true },
    image: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    displayOrder: { type: Number, default: 100 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

categorySchema.pre('validate', function setDefaults() {
  if (!this.categoryCode) {
    this.categoryCode = `CTC-${nanoid()}`;
  }
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
