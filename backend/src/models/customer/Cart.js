import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantIndex: { type: Number, default: null },
    quantity: { type: Number, default: 1 },
    priceSnapshot: {
      currentPrice: { type: Number },
      originalPrice: { type: Number },
      costPrice: { type: Number },
      variantPrice: { type: Number },
    },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
