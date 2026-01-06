import mongoose from 'mongoose';
import config from '../src/config/env.js';
import Order from '../src/models/order/Order.js';

const USERS = [
  '694280f6c197df5d614394fc',
  '6942e994ab2fc3ddd04748b4',
];

const statusList = [
  'request',
  'confirm',
  'preparing',
  'in_transit',
  'delivered',
  'canceled',
  'pending',
  'return',
];

const address = {
  name: 'Seed User',
  phone: '+254700000000',
  line1: '123 Demo Street',
  city: 'Nairobi',
  state: 'Nairobi',
  country: 'Kenya',
};

const sampleItems = [
  {
    product: new mongoose.Types.ObjectId(),
    name: 'Demo Product',
    quantity: 1,
    price: 49.99,
    regularPrice: 59.99,
    totalCost: 20,
    image: '',
  },
  {
    product: new mongoose.Types.ObjectId(),
    name: 'Another Item',
    quantity: 2,
    price: 19.5,
    regularPrice: 25,
    totalCost: 10,
    image: '',
  },
];

const computeTotals = (items) => {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountTotal = 0;
  const taxTotal = Number((subtotal * 0.08).toFixed(2));
  const shippingTotal = 5;
  const grandTotal = Number((subtotal - discountTotal + taxTotal + shippingTotal).toFixed(2));
  return { subtotal, discountTotal, taxTotal, shippingTotal, grandTotal };
};

const statusDates = (status) => {
  const now = new Date();
  const dates = { requestedAt: now };
  if (status === 'confirm') {
    dates.confirmedAt = now;
  }
  if (status === 'preparing') {
    dates.confirmedAt = now;
    dates.preparedAt = now;
  }
  if (status === 'in_transit') {
    dates.confirmedAt = now;
    dates.preparedAt = now;
    dates.inTransitAt = now;
  }
  if (status === 'delivered') {
    dates.confirmedAt = now;
    dates.preparedAt = now;
    dates.inTransitAt = now;
    dates.deliveredAt = now;
  }
  if (status === 'canceled') {
    dates.cancelledAt = now;
  }
  if (status === 'return') {
    dates.confirmedAt = now;
    dates.preparedAt = now;
    dates.inTransitAt = now;
    dates.deliveredAt = now;
    dates.refundRequestedAt = now;
  }
  return dates;
};

const seedOrders = async () => {
  const payloads = [];
  statusList.forEach((status, idx) => {
    const user = USERS[idx % USERS.length];
    const items = sampleItems.map((item, i) => ({
      ...item,
      name: `${item.name} #${idx + 1}-${i + 1}`,
    }));
    const totals = computeTotals(items);
    const dates = statusDates(status);
    payloads.push({
      user,
      items,
      ...totals,
      status,
      paymentStatus: status === 'confirm' || status === 'preparing' || status === 'in_transit' || status === 'delivered' || status === 'return' ? 'paid' : 'pending',
      address,
      notes: `Seed order with status ${status}`,
      ...dates,
    });
  });

  await Order.insertMany(payloads);
  console.log(`Seeded ${payloads.length} orders`);
};

const run = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    await seedOrders();
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
};

run();
