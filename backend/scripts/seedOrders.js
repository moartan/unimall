import mongoose from 'mongoose';
import dotenv from 'dotenv';
import config from '../src/config/env.js';
import Order from '../src/models/order/Order.js';
import Product from '../src/models/catalog/Product.js';
import User from '../src/models/auth/User.js';

dotenv.config();

const pickCustomer = async () => {
  let customer = await User.findOne({ role: 'customer', isDeleted: { $ne: true } });
  if (customer) return customer;

  customer = await User.create({
    name: 'Seed Customer',
    email: 'seed.customer@example.com',
    phone: '+252 61 000 0000',
    password: 'Seed1234!',
    role: 'customer',
    status: 'active',
  });
  return customer;
};

const buildOrder = (user, products, blueprint) => {
  const items = blueprint.items.map((i) => {
    const p = products[i.index % products.length];
    return {
      product: p._id,
      name: p.name,
      quantity: i.qty,
      price: p.salePrice,
      regularPrice: p.regularPrice,
      totalCost: p.totalCost,
      image: p.images?.[0]?.url,
    };
  });

  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const grandTotal = subtotal + (blueprint.shippingTotal || 0) - (blueprint.discountTotal || 0);

  return {
    user: user._id,
    items,
    subtotal,
    grandTotal,
    discountTotal: blueprint.discountTotal || 0,
    taxTotal: blueprint.taxTotal || 0,
    shippingTotal: blueprint.shippingTotal || 0,
    paymentStatus: blueprint.paymentStatus,
    fulfillmentStatus: blueprint.fulfillmentStatus,
    transactionId: blueprint.transactionId || blueprint.paymentMethod || 'Online',
    address: {
      name: user.name || 'Customer',
      phone: user.phone || '+252 61 000 0000',
      line1: 'Seed Street 1',
      city: 'Mogadishu',
      country: 'SO',
    },
  };
};

const orderBlueprints = [
  { paymentStatus: 'paid', fulfillmentStatus: 'delivered', transactionId: 'TXN-DEL-001', items: [{ index: 0, qty: 2 }, { index: 1, qty: 1 }] },
  { paymentStatus: 'paid', fulfillmentStatus: 'shipped', transactionId: 'TXN-SHP-002', items: [{ index: 1, qty: 1 }, { index: 2, qty: 2 }] },
  { paymentStatus: 'pending', fulfillmentStatus: 'processing', transactionId: 'TXN-PROC-003', items: [{ index: 2, qty: 1 }] },
  { paymentStatus: 'failed', fulfillmentStatus: 'pending', transactionId: 'TXN-FAIL-004', items: [{ index: 3, qty: 1 }] },
  { paymentStatus: 'paid', fulfillmentStatus: 'cancelled', transactionId: 'TXN-CAN-005', items: [{ index: 0, qty: 1 }] },
  // New seeds
  { paymentStatus: 'paid', fulfillmentStatus: 'delivered', transactionId: 'CASH-006', paymentMethod: 'Cash on Delivery', items: [{ index: 4, qty: 3 }] },
  { paymentStatus: 'paid', fulfillmentStatus: 'returned', transactionId: 'TXN-RET-007', items: [{ index: 1, qty: 1 }, { index: 2, qty: 1 }] },
  { paymentStatus: 'paid', fulfillmentStatus: 'shipped', transactionId: 'TXN-SHP-008', items: [{ index: 3, qty: 2 }] },
  { paymentStatus: 'pending', fulfillmentStatus: 'processing', transactionId: 'TXN-PROC-009', items: [{ index: 0, qty: 1 }, { index: 2, qty: 1 }] },
  { paymentStatus: 'paid', fulfillmentStatus: 'delivered', transactionId: 'TXN-DEL-010', items: [{ index: 4, qty: 1 }, { index: 1, qty: 1 }] },
];

const run = async () => {
  await mongoose.connect(config.mongoUri);
  console.log('Connected to MongoDB');

  const customer = await pickCustomer();
  const products = await Product.find({ isDeleted: { $ne: true } }).limit(5);
  if (!products.length) {
    throw new Error('No products found to seed orders. Seed products first.');
  }

  for (const blueprint of orderBlueprints) {
    const orderData = buildOrder(customer, products, blueprint);
    const order = await Order.create(orderData);
    console.log(`Seeded order ${order.orderCode} (${order.paymentStatus} / ${order.fulfillmentStatus})`);
  }

  await mongoose.disconnect();
  console.log('Order seeding complete.');
};

run().catch((err) => {
  console.error('Seeding failed', err);
  mongoose.disconnect();
});
