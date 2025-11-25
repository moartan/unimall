import createError from 'http-errors';
import Cart from '../../models/customer/Cart.js';
import Product from '../../models/catalog/Product.js';

const ensureProductAvailable = (product, variantIndex) => {
  if (!product || product.isDeleted || product.status !== 'Published') {
    throw createError(404, 'Product not available');
  }
  let variant = null;
  if (variantIndex !== null && variantIndex !== undefined) {
    if (!product.variants || !product.variants[variantIndex]) throw createError(400, 'Invalid variant');
    variant = product.variants[variantIndex];
  }
  return variant;
};

const snapshotPrice = (product, variant) => ({
  currentPrice: product.currentPrice,
  originalPrice: product.originalPrice,
  costPrice: product.costPrice,
  variantPrice: variant?.price,
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
    const { productId, variantIndex = null, quantity = 1 } = req.body;
    if (!productId) throw createError(400, 'productId required');
    const product = await Product.findOne({ _id: productId, isDeleted: { $ne: true }, status: 'Published' });
    const variant = ensureProductAvailable(product, variantIndex);
    const cart = (await Cart.findOne({ user: req.user._id })) || (await Cart.create({ user: req.user._id, items: [] }));
    const existing = cart.items.find(
      (i) =>
        i.product.toString() === productId &&
        ((i.variantIndex === null && variantIndex === null) || i.variantIndex === variantIndex)
    );
    if (existing) {
      existing.quantity += quantity;
      existing.priceSnapshot = snapshotPrice(product, variant);
    } else {
      cart.items.push({
        product: productId,
        variantIndex,
        quantity,
        priceSnapshot: snapshotPrice(product, variant),
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
    const { variantIndex = null, quantity } = req.body;
    if (quantity === undefined || quantity < 1) throw createError(400, 'Quantity must be >= 1');
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) throw createError(404, 'Cart not found');
    const item = cart.items.find(
      (i) =>
        i.product.toString() === productId &&
        ((i.variantIndex === null && variantIndex === null) || i.variantIndex === variantIndex)
    );
    if (!item) throw createError(404, 'Item not in cart');
    const product = await Product.findOne({ _id: productId, isDeleted: { $ne: true }, status: 'Published' });
    const variant = ensureProductAvailable(product, variantIndex);
    item.quantity = quantity;
    item.priceSnapshot = snapshotPrice(product, variant);
    await cart.save();
    res.json({ cart });
  } catch (err) {
    next(err);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const variantIndex = req.query.variantIndex ? Number(req.query.variantIndex) : null;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.json({ cart: { user: req.user._id, items: [] } });
    cart.items = cart.items.filter(
      (i) =>
        !(
          i.product.toString() === productId &&
          ((i.variantIndex === null && variantIndex === null) || i.variantIndex === variantIndex)
        )
    );
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
