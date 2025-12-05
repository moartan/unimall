import createError from 'http-errors';
import Category from '../../models/catalog/Category.js';
import { logAction } from '../auth/authService.js';

const parsePagination = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const createCategory = async (req, res, next) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };
    const category = await Category.create(data);
    await logAction(req.user._id, 'category_create', { metadata: { id: category._id } });
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    if (!category) throw createError(404, 'Category not found');
    await logAction(req.user._id, 'category_update', { metadata: { id } });
    res.json({ category });
  } catch (err) {
    next(err);
  }
};

export const listCategories = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const filter = { isDeleted: { $ne: true } };
    if (req.query.status) filter.status = req.query.status;

    const pipeline = [
      { $match: filter },
      { $sort: { displayOrder: 1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          let: { categoryId: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ['$category', '$$categoryId'] }, { $ne: ['$isDeleted', true] }] } } },
            { $count: 'count' },
          ],
          as: 'productMeta',
        },
      },
      {
        $addFields: {
          productCount: { $ifNull: [{ $arrayElemAt: ['$productMeta.count', 0] }, 0] },
        },
      },
      { $project: { productMeta: 0 } },
    ];

    const [categories, total] = await Promise.all([
      Category.aggregate(pipeline),
      Category.countDocuments(filter),
    ]);
    res.json({ categories, page, limit, total });
  } catch (err) {
    next(err);
  }
};

export const getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!category) throw createError(404, 'Category not found');
    res.json({ category });
  } catch (err) {
    next(err);
  }
};

export const softDeleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category || category.isDeleted) throw createError(404, 'Category not found');
    category.isDeleted = true;
    category.deletedAt = new Date();
    await category.save();
    await logAction(req.user._id, 'category_delete', { metadata: { id } });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};

export const listDeletedCategories = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const [categories, total] = await Promise.all([
      Category.find({ isDeleted: true }).sort('-deletedAt').skip(skip).limit(limit),
      Category.countDocuments({ isDeleted: true }),
    ]);
    res.json({ categories, page, limit, total });
  } catch (err) {
    next(err);
  }
};

export const restoreCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category || !category.isDeleted) throw createError(404, 'Category not found or not deleted');
    category.isDeleted = false;
    category.deletedAt = null;
    await category.save();
    await logAction(req.user._id, 'category_restore', { metadata: { id } });
    res.json({ category });
  } catch (err) {
    next(err);
  }
};
