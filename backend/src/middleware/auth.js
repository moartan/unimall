import createError from 'http-errors';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import User from '../models/auth/User.js';

export const authGuard = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw createError(401, 'Missing authorization header');
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    const user = await User.findById(decoded.sub);
    if (!user) throw createError(401, 'User not found');
    req.user = user;
    next();
  } catch (err) {
    next(createError(401, err.message || 'Unauthorized'));
  }
};

export const requireRoles = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(createError(403, 'Forbidden'));
  }
  return next();
};

export const requireEmployeeRoles = (...employeeRoles) => (req, _res, next) => {
  if (req.user?.role !== 'employee' || !employeeRoles.includes(req.user.employeeRole)) {
    return next(createError(403, 'Forbidden'));
  }
  return next();
};
