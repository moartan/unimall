import createError from 'http-errors';
import Wishlist from '../../models/customer/Wishlist.js';
import Product from '../../models/catalog/Product.js';

export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('items.product');
    if (wishlist) {
      // prune deleted/unpublished products
      wishlist.items = wishlist.items.filter(
        (i) => i.product && !i.product.isDeleted && i.product.status === 'Published'
      );
      await wishlist.save();
    }
    res.json({ wishlist: wishlist || { user: req.user._id, items: [] } });
  } catch (err) {
    next(err);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) throw createError(400, 'productId required');
    const product = await Product.findOne({ _id: productId, isDeleted: { $ne: true }, status: 'Published' });
    if (!product) throw createError(404, 'Product not found');
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [{ product: productId }] });
    } else {
      const exists = wishlist.items.find((i) => i.product.toString() === productId);
      if (!exists) {
        wishlist.items.push({ product: productId });
        await wishlist.save();
      }
    }
    res.json({ wishlist });
  } catch (err) {
    next(err);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) return res.json({ wishlist: { user: req.user._id, items: [] } });
    wishlist.items = wishlist.items.filter((i) => i.product.toString() !== productId);
    await wishlist.save();
    res.json({ wishlist });
  } catch (err) {
    next(err);
  }
};

export const clearWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    } else {
      wishlist.items = [];
      await wishlist.save();
    }
    res.json({ wishlist });
  } catch (err) {
    next(err);
  }
};
