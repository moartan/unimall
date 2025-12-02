import mongoose from 'mongoose';

const LABELS = ['home', 'work', 'other'];

const addressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, enum: LABELS, default: 'home' },
    phone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    country: { type: String, required: true, trim: true },
    note: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
    addressCode: { type: String, unique: true },
  },
  { timestamps: true }
);

addressSchema.pre('save', async function ensureSingleDefault() {
  if (this.isModified('isDefault') && this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
});

addressSchema.pre('validate', function setCode() {
  if (!this.addressCode) {
    const random = Math.random().toString(36).slice(2, 10).toUpperCase();
    this.addressCode = `ADR-${random}`;
  }
});

const Address = mongoose.model('Address', addressSchema);

export default Address;
