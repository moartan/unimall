import createError from 'http-errors';
import Product from '../../models/catalog/Product.js';
import Category from '../../models/catalog/Category.js';
import { logAction } from '../auth/authService.js';
import { deleteAsset } from '../../utils/cloudinary.js';

const parsePagination = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildFilters = (req) => {
  const filter = { isDeleted: { $ne: true } };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.q) {
    filter.$text = { $search: req.query.q };
  }
  if (req.query.minPrice || req.query.maxPrice) {
    filter.currentPrice = {};
    if (req.query.minPrice) filter.currentPrice.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.currentPrice.$lte = Number(req.query.maxPrice);
  }
  if (req.query.tags) filter.tags = { $in: req.query.tags.split(',') };
  if (req.query.featured === 'true') filter.isFeatured = true;
  if (req.query.promoted === 'true') filter.isPromoted = true;
  if (req.query.exclusive === 'true') filter.isExclusive = true;

  return filter;
};

const MAX_IMAGES = 20;

const sanitizeImages = (images) => {
  if (!images) return undefined;
  if (!Array.isArray(images)) throw createError(400, 'Images must be an array');
  if (images.length > MAX_IMAGES) throw createError(400, `Maximum ${MAX_IMAGES} images allowed`);
  return images.map((img, idx) => ({
    url: img.url,
    publicId: img.publicId,
    alt: img.alt || '',
    order: typeof img.order === 'number' ? img.order : idx,
  }));
};

const validateVariants = (variants = [], productSku) => {
  if (!Array.isArray(variants)) throw createError(400, 'Variants must be an array');
  const skus = new Set();
  variants.forEach((v) => {
    if (v.sku) {
      if (skus.has(v.sku)) throw createError(400, `Duplicate variant SKU: ${v.sku}`);
      if (productSku && v.sku === productSku) throw createError(400, 'Variant SKU cannot match product SKU');
      skus.add(v.sku);
    }
  });
  return variants;
};

const ensureGlobalSkuUniqueness = async (sku, variantSkus = [], excludeId = null) => {
  const skus = [sku, ...variantSkus].filter(Boolean);
  if (!skus.length) return;
  const conflict = await Product.findOne({
    _id: excludeId ? { $ne: excludeId } : { $exists: true },
    isDeleted: { $ne: true },
    $or: [
      { sku: { $in: skus } },
      { 'variants.sku': { $in: skus } },
    ],
  });
  if (conflict) throw createError(400, 'SKU must be unique across products and variants');
};

export const createProduct = async (req, res, next) => {
  try {
    const payload = { ...req.body, createdBy: req.user._id };
    if (payload.images) payload.images = sanitizeImages(payload.images);
    if (payload.variants) payload.variants = validateVariants(payload.variants, payload.sku);
    await ensureGlobalSkuUniqueness(payload.sku, (payload.variants || []).map((v) => v.sku));
    const categoryExists = await Category.findOne({ _id: payload.category, isDeleted: { $ne: true } });
    if (!categoryExists) throw createError(400, 'Invalid category');
    const product = await Product.create(payload);
    await logAction(req.user._id, 'product_create', { metadata: { id: product._id } });
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body, updatedBy: req.user._id };
    if (payload.category) {
      const categoryExists = await Category.findOne({ _id: payload.category, isDeleted: { $ne: true } });
      if (!categoryExists) throw createError(400, 'Invalid category');
    }
    if (payload.images) payload.images = sanitizeImages(payload.images);
    if (payload.variants) payload.variants = validateVariants(payload.variants, payload.sku);
    await ensureGlobalSkuUniqueness(payload.sku, (payload.variants || []).map((v) => v.sku), id);
    const product = await Product.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      payload,
      { new: true, runValidators: true }
    );
    if (!product) throw createError(404, 'Product not found');
    // optional: cleanup removed images if publicIds provided as toRemove
    if (payload.removeImagePublicIds && Array.isArray(payload.removeImagePublicIds)) {
      await Promise.all(payload.removeImagePublicIds.map((pid) => deleteAsset(pid)));
    }
    await logAction(req.user._id, 'product_update', { metadata: { id } });
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

export const listProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const filter = buildFilters(req);
    const sort = req.query.sort || '-createdAt';
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).populate('category'),
      Product.countDocuments(filter),
    ]);
    res.json({ products, page, limit, total });
  } catch (err) {
    next(err);
  }
};

export const listPublishedProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const filter = buildFilters(req);
    filter.status = 'Published';

    if (req.query.minPrice || req.query.maxPrice) {
      filter.currentPrice = {};
      if (req.query.minPrice) filter.currentPrice.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.currentPrice.$lte = Number(req.query.maxPrice);
    }
    if (req.query.tags) filter.tags = { $in: req.query.tags.split(',') };
    if (req.query.featured === 'true') filter.isFeatured = true;
    if (req.query.promoted === 'true') filter.isPromoted = true;
    if (req.query.exclusive === 'true') filter.isExclusive = true;

    const sort = req.query.sort || '-createdAt';
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).populate('category'),
      Product.countDocuments(filter),
    ]);
    res.json({ products, page, limit, total });
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const product = await Product.findOne({
      $and: [
        { isDeleted: { $ne: true } },
        { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] },
      ],
    }).populate('category');
    if (!product) throw createError(404, 'Product not found');
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

export const softDeleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product || product.isDeleted) throw createError(404, 'Product not found');
    // delete images from cloudinary
    const allPublicIds = [];
    if (product.images) allPublicIds.push(...product.images.map((i) => i.publicId).filter(Boolean));
    if (product.variants) {
      product.variants.forEach((v) => {
        if (v.images) allPublicIds.push(...v.images.map((i) => i.publicId).filter(Boolean));
      });
    }
    await Promise.all(allPublicIds.map((pid) => deleteAsset(pid)));
    product.isDeleted = true;
    product.deletedAt = new Date();
    await product.save();
    await logAction(req.user._id, 'product_delete', { metadata: { id } });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

export const listDeletedProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const [products, total] = await Promise.all([
      Product.find({ isDeleted: true }).sort('-deletedAt').skip(skip).limit(limit),
      Product.countDocuments({ isDeleted: true }),
    ]);
    res.json({ products, page, limit, total });
  } catch (err) {
    next(err);
  }
};

export const restoreProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product || !product.isDeleted) throw createError(404, 'Product not found or not deleted');
    product.isDeleted = false;
    product.deletedAt = null;
    await product.save();
    await logAction(req.user._id, 'product_restore', { metadata: { id } });
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

export const addVariant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const product = await Product.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!product) throw createError(404, 'Product not found');
    validateVariants([payload], product.sku);
    await ensureGlobalSkuUniqueness(product.sku, [...(product.variants || []).map((v) => v.sku), payload.sku], id);
    product.variants = product.variants || [];
    product.variants.push(payload);
    await product.save();
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
};

export const updateVariant = async (req, res, next) => {
  try {
    const { id, variantIndex } = req.params;
    const idx = Number(variantIndex);
    const payload = req.body;
    const product = await Product.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!product) throw createError(404, 'Product not found');
    if (!product.variants || !product.variants[idx]) throw createError(404, 'Variant not found');
    const variantsCopy = [...product.variants];
    const updated = { ...variantsCopy[idx]._doc, ...payload };
    validateVariants([updated], product.sku);
    const otherSkus = variantsCopy.map((v, i) => (i === idx ? null : v.sku)).filter(Boolean);
    await ensureGlobalSkuUniqueness(product.sku, [...otherSkus, updated.sku], id);
    variantsCopy[idx] = updated;
    product.variants = variantsCopy;
    await product.save();
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

export const deleteVariant = async (req, res, next) => {
  try {
    const { id, variantIndex } = req.params;
    const idx = Number(variantIndex);
    const product = await Product.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!product || !product.variants || !product.variants[idx]) throw createError(404, 'Variant not found');
    // cleanup variant images
    const publicIds = product.variants[idx].images?.map((i) => i.publicId).filter(Boolean) || [];
    await Promise.all(publicIds.map((pid) => deleteAsset(pid)));
    product.variants.splice(idx, 1);
    await product.save();
    res.json({ product });
  } catch (err) {
    next(err);
  }
};
