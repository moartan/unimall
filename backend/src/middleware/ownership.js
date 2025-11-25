import createError from 'http-errors';

export const requireAdminForDelete = (req, _res, next) => {
  if (req.user?.role === 'employee' && req.user.employeeRole === 'admin') return next();
  return next(createError(403, 'Only admin can delete'));
};
