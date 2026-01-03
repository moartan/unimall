import createError from 'http-errors';
import mongoose from 'mongoose';
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

const buildFilters = (req, resolvedCategoryId = null) => {
  const filter = { isDeleted: { $ne: true } };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.trending === 'true') filter.isTrending = true;
  if (Array.isArray(resolvedCategoryId) && resolvedCategoryId.length) {
    filter.category = { $in: resolvedCategoryId };
  } else if (resolvedCategoryId) {
    filter.category = resolvedCategoryId;
  } else if (req.query.category) {
    const cat = Array.isArray(req.query.category)
      ? req.query.category
      : String(req.query.category).split(',').map((c) => c.trim()).filter(Boolean);
    if (cat.length === 1) {
      filter.category = cat[0];
    } else if (cat.length > 1) {
      filter.category = { $in: cat };
    }
  }
  if (req.query.search) {
    const regex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { name: regex },
      { shortDescription: regex },
      { slug: regex },
      { productCode: regex },
    ];
  } else if (req.query.q) {
    filter.$text = { $search: req.query.q };
  }
  if (req.query.minPrice || req.query.maxPrice) {
    filter.salePrice = {};
    if (req.query.minPrice) filter.salePrice.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.salePrice.$lte = Number(req.query.maxPrice);
  }
  if (req.query.featured === 'true') filter.isFeatured = true;
  if (req.query.exclusive === 'true') filter.isExclusive = true;
  if (req.query.noads === 'true') {
    filter.isExclusive = false;
    filter.isFeatured = false;
  }

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

export const createProduct = async (req, res, next) => {
  try {
    const payload = { ...req.body, createdBy: req.user._id };
    if (payload.images) payload.images = sanitizeImages(payload.images);
    const categoryExists = await Category.findOne({ _id: payload.category, isDeleted: { $ne: true } });
    if (!categoryExists) throw createError(400, 'Invalid category');
    if (payload.status === 'Published' && !payload.publishedAt) {
      payload.publishedAt = new Date();
    }
    const product = await Product.create(payload);
    await logAction(req.user._id, 'product_create', { metadata: { id: product._id } });
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const payload = { ...req.body, updatedBy: req.user._id };
    if (payload.category) {
      const categoryExists = await Category.findOne({ _id: payload.category, isDeleted: { $ne: true } });
      if (!categoryExists) throw createError(400, 'Invalid category');
    }
    if (payload.images) payload.images = sanitizeImages(payload.images);
    const product = await Product.findOne({
      $and: [
        { isDeleted: { $ne: true } },
        { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] },
      ],
    });
    if (!product) throw createError(404, 'Product not found');
    if (payload.status === 'Published' && !product.publishedAt) {
      payload.publishedAt = new Date();
    }
    Object.assign(product, payload);
    await product.save();
    if (payload.removeImagePublicIds && Array.isArray(payload.removeImagePublicIds)) {
      await Promise.all(payload.removeImagePublicIds.map((pid) => deleteAsset(pid)));
    }
    await logAction(req.user._id, 'product_update', { metadata: { id: product._id } });
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

export const updateDisplayPriority = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { displayPriority } = req.body;
    if (displayPriority === undefined || displayPriority === null || Number.isNaN(Number(displayPriority))) {
      throw createError(400, 'displayPriority is required and must be a number');
    }
    const product = await Product.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!product) throw createError(404, 'Product not found');
    product.displayPriority = Number(displayPriority);
    product.updatedBy = req.user._id;
    await product.save();
    await logAction(req.user._id, 'product_priority_update', { metadata: { id: product._id, displayPriority } });
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

export const listProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    let categoryId = null;
    if (req.query.category) {
      if (mongoose.Types.ObjectId.isValid(req.query.category)) {
        categoryId = req.query.category;
      } else {
        const cat = await Category.findOne({ slug: req.query.category, isDeleted: { $ne: true } });
        if (cat) categoryId = cat._id;
        else return res.json({ products: [], page, limit, total: 0 });
      }
    }
    const filter = buildFilters(req, categoryId);
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
    let resolvedCategoryIds = [];
    if (req.query.category) {
      const raw = Array.isArray(req.query.category)
        ? req.query.category
        : String(req.query.category).split(',').map((c) => c.trim()).filter(Boolean);
      const objectIds = raw.filter((c) => mongoose.Types.ObjectId.isValid(c));
      const slugCandidates = raw.filter((c) => !mongoose.Types.ObjectId.isValid(c));

      if (slugCandidates.length) {
        const found = await Category.find({
          slug: { $in: slugCandidates },
          isDeleted: { $ne: true },
        }).select('_id');
        resolvedCategoryIds.push(...found.map((c) => c._id.toString()));
      }
      resolvedCategoryIds.push(...objectIds);
      // If none resolved, short-circuit to empty result
      if (!resolvedCategoryIds.length) {
        return res.json({ products: [], page, limit, total: 0 });
      }
    }
    const filter = buildFilters(req, resolvedCategoryIds.length ? resolvedCategoryIds : null);
    filter.status = 'Published';

    if (req.query.minPrice || req.query.maxPrice) {
      filter.salePrice = {};
      if (req.query.minPrice) filter.salePrice.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.salePrice.$lte = Number(req.query.maxPrice);
    }
    if (req.query.featured === 'true') filter.isFeatured = true;
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
    const asObjectId = mongoose.Types.ObjectId.isValid(idOrSlug) ? idOrSlug : null;
    const product = await Product.findOne({
      $and: [
        { isDeleted: { $ne: true } },
        {
          $or: [
            ...(asObjectId ? [{ _id: asObjectId }] : []),
            { slug: idOrSlug },
          ],
        },
      ],
    }).populate('category');
    if (!product) throw createError(404, 'Product not found');
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

export const trackProductView = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const asObjectId = mongoose.Types.ObjectId.isValid(idOrSlug) ? idOrSlug : null;
    const match = {
      $and: [
        { isDeleted: { $ne: true } },
        {
          $or: [
            ...(asObjectId ? [{ _id: asObjectId }] : []),
            { slug: idOrSlug },
          ],
        },
      ],
    };

    const updated = await Product.findOneAndUpdate(
      match,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).select('_id viewCount');

    if (!updated) throw createError(404, 'Product not found');

    res.json({ viewCount: updated.viewCount });
  } catch (err) {
    next(err);
  }
};

export const softDeleteProduct = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const hardDelete = req.query.permanent === 'true';
    const asObjectId = mongoose.Types.ObjectId.isValid(idOrSlug) ? idOrSlug : null;
    const product = await Product.findOne({
      $or: [
        ...(asObjectId ? [{ _id: asObjectId }] : []),
        { slug: idOrSlug },
      ],
    });
    if (!product) throw createError(404, 'Product not found');
    if (!hardDelete && product.isDeleted) throw createError(404, 'Product not found');
    const allPublicIds = [];
    if (product.images) allPublicIds.push(...product.images.map((i) => i.publicId).filter(Boolean));
    await Promise.all(allPublicIds.map((pid) => deleteAsset(pid)));

    if (hardDelete) {
      await Product.deleteOne({ _id: product._id });
      await logAction(req.user._id, 'product_hard_delete', { metadata: { id: product._id } });
      return res.json({ message: 'Product permanently deleted' });
    }

    product.isDeleted = true;
    product.deletedAt = new Date();
    await product.save();
    await logAction(req.user._id, 'product_delete', { metadata: { id: product._id } });
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
