import createError from 'http-errors';
import Cart from '../../models/customer/Cart.js';
import Product from '../../models/catalog/Product.js';

const ensureProductAvailable = (product) => {
  if (!product || product.isDeleted || product.status !== 'Published') {
    throw createError(404, 'Product not available');
  }
};

const snapshotPrice = (product) => ({
  salePrice: product.salePrice,
  regularPrice: product.regularPrice,
  totalCost: product.totalCost,
});

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    // prune unavailable products
    if (cart) {
      cart.items = cart.items.filter(
        (i) => i.product && !i.product.isDeleted && i.product.status === 'Published'
      );
      await cart.save();
    }
    res.json({ cart: cart || { user: req.user._id, items: [] } });
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) throw createError(400, 'productId required');
    const product = await Product.findOne({ _id: productId, isDeleted: { $ne: true }, status: 'Published' });
    ensureProductAvailable(product);
    const cart = (await Cart.findOne({ user: req.user._id })) || (await Cart.create({ user: req.user._id, items: [] }));
    const existing = cart.items.find((i) => i.product.toString() === productId);
    if (existing) {
      existing.quantity += quantity;
      existing.priceSnapshot = snapshotPrice(product);
    } else {
      cart.items.push({
        product: productId,
        quantity,
        priceSnapshot: snapshotPrice(product),
      });
    }
    await cart.save();
    res.json({ cart });
  } catch (err) {
    next(err);
  }
};

export const updateQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    if (quantity === undefined || quantity < 1) throw createError(400, 'Quantity must be >= 1');
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) throw createError(404, 'Cart not found');
    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) throw createError(404, 'Item not in cart');
    const product = await Product.findOne({ _id: productId, isDeleted: { $ne: true }, status: 'Published' });
    ensureProductAvailable(product);
    item.quantity = quantity;
    item.priceSnapshot = snapshotPrice(product);
    await cart.save();
    res.json({ cart });
  } catch (err) {
    next(err);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.json({ cart: { user: req.user._id, items: [] } });
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();
    res.json({ cart });
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    } else {
      cart.items = [];
      await cart.save();
    }
    res.json({ cart });
  } catch (err) {
    next(err);
  }
};
