import createError from 'http-errors';
import User from '../../models/auth/User.js';
import { logAction } from './authService.js';

const safeUser = (user) => {
  const { password, __v, refreshTokenHash, ...rest } = user.toObject();
  return rest;
};

const buildQuery = (role, search) => {
  const query = { role, isDeleted: { $ne: true } };
  if (search) {
    query.$or = [
      { email: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
    ];
  }
  return query;
};

const parsePagination = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const listCustomers = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const query = buildQuery('customer', req.query.q);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);
    res.json({ users: users.map(safeUser), page, limit, total });
  } catch (err) {
    next(err);
  }
};

export const listEmployees = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const query = buildQuery('employee', req.query.q);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);
    res.json({ users: users.map(safeUser), page, limit, total });
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'block'].includes(status)) throw createError(400, 'Invalid status');
    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    if (!user) throw createError(404, 'User not found');
    await logAction(req.user._id, 'update_status', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { targetUser: id, status },
    });
    res.json({ user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const softDelete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) throw createError(404, 'User not found');
    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();
    await logAction(req.user._id, 'soft_delete_user', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { targetUser: id },
    });
    res.json({ message: 'User soft-deleted' });
  } catch (err) {
    next(err);
  }
};
