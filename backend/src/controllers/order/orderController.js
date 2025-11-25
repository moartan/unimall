import createError from 'http-errors';
import Order from '../../models/order/Order.js';
import Cart from '../../models/customer/Cart.js';
import Product from '../../models/catalog/Product.js';
import User from '../../models/auth/User.js';
import { notify } from '../auth/authService.js';
import { sendEmail } from '../../utils/email.js';
import { orderPlacedTemplate, orderStatusTemplate, refundRequestedTemplate } from '../../utils/emailTemplates.js';

const computeTotals = (items, { discountTotal = 0, taxRate = 0, shippingTotal = 0 } = {}) => {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const taxTotal = Number(((subtotal - discountTotal) * taxRate).toFixed(2));
  const grandTotal = Number((subtotal - discountTotal + taxTotal + shippingTotal).toFixed(2));
  return { subtotal, discountTotal, taxTotal, shippingTotal, grandTotal };
};

const recomputeTotalsFromOrder = (order) => {
  const subtotal = order.items.reduce((sum, i) => sum + i.price * (i.quantity - (i.cancelledQty || 0)), 0);
  order.subtotal = Number(subtotal.toFixed(2));
  order.grandTotal = Number(
    (order.subtotal - order.discountTotal + order.taxTotal + order.shippingTotal).toFixed(2)
  );
};

const mapCartItemToOrderItem = (product, cartItem) => {
  const variant = cartItem.variantIndex !== null && product.variants ? product.variants[cartItem.variantIndex] : null;
  const price = variant?.price || product.currentPrice;
  return {
    product: product._id,
    variantIndex: cartItem.variantIndex,
    name: product.name,
    sku: variant?.sku || product.sku,
    quantity: cartItem.quantity,
    price,
    originalPrice: product.originalPrice,
    costPrice: product.costPrice,
    variantPrice: variant?.price,
    image: variant?.images?.[0]?.url || product.images?.[0]?.url,
  };
};

const restockItems = async (items) => {
  const productIds = [...new Set(items.map((i) => i.product))];
  const products = await Product.find({ _id: { $in: productIds } });
  const map = new Map(products.map((p) => [p._id.toString(), p]));
  for (const item of items) {
    const product = map.get(item.product.toString());
    if (!product) continue;
    if (item.variantIndex !== null && product.variants && product.variants[item.variantIndex]) {
      const variant = product.variants[item.variantIndex];
      if (variant.stock !== undefined) variant.stock += item.quantity;
    } else {
      product.stock += item.quantity;
    }
    await product.save();
  }
};

const sendCustomerEmail = async (user, subject, html) => {
  if (!user?.email) return;
  try {
    await sendEmail({ to: user.email, subject, html });
  } catch (e) {
    // swallow email errors to avoid blocking
  }
};

const allowedTransitions = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled', 'returned', 'refund_requested'],
  delivered: ['returned', 'refund_requested'],
  refund_requested: ['returned', 'cancelled'],
  returned: [],
  cancelled: [],
};

const assertTransition = (current, next) => {
  if (!next) return;
  const allowed = allowedTransitions[current] || [];
  if (!allowed.includes(next)) {
    throw createError(400, `Cannot transition from ${current} to ${next}`);
  }
};

export const createOrderFromCart = async (req, res, next) => {
  try {
    const { address, notes, discountTotal = 0, taxRate = 0, shippingTotal = 0 } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) throw createError(400, 'Cart is empty');

    const products = await Product.find({
      _id: { $in: cart.items.map((i) => i.product) },
      isDeleted: { $ne: true },
      status: 'Published',
    });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems = [];
    for (const item of cart.items) {
      const product = productMap.get(item.product.toString());
      if (!product) throw createError(400, 'Product unavailable');
      const variant =
        item.variantIndex !== null && product.variants ? product.variants[item.variantIndex] : null;
      if (variant && variant.stock !== undefined && variant.stock < item.quantity && !variant.allowBackorder) {
        throw createError(400, `Insufficient stock for ${product.name}`);
      }
      if (!variant && product.stock < item.quantity) {
        throw createError(400, `Insufficient stock for ${product.name}`);
      }
      orderItems.push(mapCartItemToOrderItem(product, item));
    }

    const totals = computeTotals(orderItems, { discountTotal, taxRate, shippingTotal });

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      ...totals,
      address,
      notes,
    });

    // deduct stock
    for (const item of orderItems) {
      const product = productMap.get(item.product.toString());
      if (item.variantIndex !== null && product.variants) {
        const variant = product.variants[item.variantIndex];
        if (variant && variant.stock !== undefined) {
          variant.stock = Math.max(0, variant.stock - item.quantity);
        }
      } else {
        product.stock = Math.max(0, product.stock - item.quantity);
      }
      await product.save();
    }

    // clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ order });
    // notify employees
    const employees = await User.find({ role: 'employee', isDeleted: { $ne: true }, status: { $ne: 'block' } });
    await Promise.all(
      employees.map((emp) =>
        notify(emp._id, {
          title: 'New order placed',
          body: `Order ${order.orderCode} created`,
          metadata: { orderId: order._id },
        })
      )
    );
    // email customer
    const customer = await User.findById(req.user._id);
    await sendCustomerEmail(
      customer,
      `Order ${order.orderCode} placed`,
      orderPlacedTemplate(order)
    );
  } catch (err) {
    next(err);
  }
};

export const listMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

export const getMyOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, user: req.user._id });
    if (!order) throw createError(404, 'Order not found');
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

export const listAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort('-createdAt').populate('user');
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus, fulfillmentStatus } = req.body;
    const order = await Order.findById(id);
    if (!order) throw createError(404, 'Order not found');
    const prevStatus = order.fulfillmentStatus;
    assertTransition(prevStatus, fulfillmentStatus);
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (fulfillmentStatus) {
      order.fulfillmentStatus = fulfillmentStatus;
      if (fulfillmentStatus === 'delivered') order.deliveredAt = new Date();
      if (fulfillmentStatus === 'cancelled') order.cancelledAt = new Date();
      if (fulfillmentStatus === 'returned') order.returnedAt = new Date();
      if (fulfillmentStatus === 'refund_requested') order.refundRequestedAt = new Date();
      // restock on cancelled or returned transitions (only once)
      if ((fulfillmentStatus === 'cancelled' || fulfillmentStatus === 'returned') && prevStatus !== fulfillmentStatus) {
        await restockItems(order.items);
      }
    }
    await order.save();
    await notify(order.user, {
      title: 'Order status updated',
      body: `Order ${order.orderCode} status: ${fulfillmentStatus || order.fulfillmentStatus}`,
      metadata: { orderId: order._id },
    });
    const customer = await User.findById(order.user);
    await sendCustomerEmail(
      customer,
      `Order ${order.orderCode} status update`,
      orderStatusTemplate(order)
    );
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

export const requestRefund = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, user: req.user._id });
    if (!order) throw createError(404, 'Order not found');
    if (order.fulfillmentStatus !== 'delivered') throw createError(400, 'Order not delivered');
    if (!order.deliveredAt) throw createError(400, 'Delivered date missing');
    const now = Date.now();
    const diffHours = (now - order.deliveredAt.getTime()) / (1000 * 60 * 60);
    if (diffHours > 72) throw createError(400, 'Refund window expired');
    order.fulfillmentStatus = 'refund_requested';
    order.refundRequestedAt = new Date();
    await order.save();
    // notify employees
    const employees = await User.find({ role: 'employee', isDeleted: { $ne: true }, status: { $ne: 'block' } });
    await Promise.all(
      employees.map((emp) =>
        notify(emp._id, {
          title: 'Refund requested',
          body: `Order ${order.orderCode} refund requested`,
          metadata: { orderId: order._id },
        })
      )
    );
    const customer = await User.findById(order.user);
    await sendCustomerEmail(
      customer,
      `Refund requested for ${order.orderCode}`,
      refundRequestedTemplate(order)
    );
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

export const cancelMyOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, user: req.user._id });
    if (!order) throw createError(404, 'Order not found');
    if (!['pending', 'processing'].includes(order.fulfillmentStatus)) {
      throw createError(400, 'Order cannot be cancelled in current status');
    }
    if (order.fulfillmentStatus !== 'cancelled') {
      await restockItems(order.items);
    }
    order.fulfillmentStatus = 'cancelled';
    order.cancelledAt = new Date();
    await order.save();
    const employees = await User.find({ role: 'employee', isDeleted: { $ne: true }, status: { $ne: 'block' } });
    await Promise.all(
      employees.map((emp) =>
        notify(emp._id, {
          title: 'Order cancelled by customer',
          body: `Order ${order.orderCode} cancelled`,
          metadata: { orderId: order._id },
        })
      )
    );
    const customer = await User.findById(order.user);
    await sendCustomerEmail(
      customer,
      `Order ${order.orderCode} cancelled`,
      `<p>Your order has been cancelled.</p>`
    );
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

export const cancelOrderItems = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { items } = req.body; // [{productId, variantIndex, quantity}]
    if (!Array.isArray(items) || items.length === 0) throw createError(400, 'Items required');
    const order = await Order.findById(id);
    if (!order) throw createError(404, 'Order not found');
    if (!['pending', 'processing', 'shipped'].includes(order.fulfillmentStatus)) {
      throw createError(400, 'Order not cancellable in current status');
    }
    const restockList = [];
    for (const cancelItem of items) {
      const { productId, variantIndex = null, quantity } = cancelItem;
      if (!productId || !quantity || quantity < 1) throw createError(400, 'Invalid item payload');
      const orderItem = order.items.find(
        (i) =>
          i.product.toString() === productId &&
          ((i.variantIndex === null && variantIndex === null) || i.variantIndex === variantIndex)
      );
      if (!orderItem) throw createError(404, 'Order item not found');
      const remaining = orderItem.quantity - (orderItem.cancelledQty || 0);
      if (quantity > remaining) throw createError(400, 'Cancel quantity exceeds remaining');
      orderItem.cancelledQty = (orderItem.cancelledQty || 0) + quantity;
      restockList.push({ product: orderItem.product, variantIndex, quantity });
    }
    recomputeTotalsFromOrder(order);
    await order.save();
    // restock now
    await restockItems(
      restockList.map((i) => ({
        product: i.product,
        variantIndex: i.variantIndex,
        quantity: i.quantity,
      }))
    );
    const customer = await User.findById(order.user);
    await sendCustomerEmail(
      customer,
      `Items cancelled in ${order.orderCode}`,
      `<p>Some items were cancelled in your order.</p>`
    );
    res.json({ order });
  } catch (err) {
    next(err);
  }
};
