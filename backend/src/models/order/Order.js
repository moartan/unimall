import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }, // sale price at time of order
    regularPrice: { type: Number },
    totalCost: { type: Number },
    image: { type: String },
    cancelledQty: { type: Number, default: 0 },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    country: { type: String, required: true, trim: true },
    note: { type: String, trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, unique: true, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    discountTotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    shippingTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    fulfillmentStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refund_requested'],
      default: 'pending',
    },
    address: addressSchema,
    notes: { type: String, trim: true },
    transactionId: { type: String, trim: true },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    returnedAt: { type: Date },
    refundRequestedAt: { type: Date },
  },
  { timestamps: true }
);

orderSchema.pre('validate', function setCode(next) {
  if (!this.orderCode) {
    const random = Math.random().toString(36).slice(2, 10).toUpperCase();
    this.orderCode = `ORD-${random}`;
  }
  if (typeof next === 'function') {
    next();
  }
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
