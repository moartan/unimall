import csrf from 'csurf';

// Using cookies for csrf token storage; must be used after cookie-parser
const csrfProtection = csrf({ cookie: true });

// Skip CSRF only for token fetch and auth login/refresh to allow obtaining tokens
export const csrfSkip = (req, res, next) => {
  const path = req.path || '';
  if (
    path === '/csrf-token' ||
    path === '/auth/customer/login' ||
    path === '/auth/employee/login' ||
    path === '/auth/customer/logout' ||
    path === '/auth/employee/logout' ||
    path === '/auth/customer/forgot-password' ||
    path === '/auth/customer/reset-password' ||
    path === '/auth/employee/forgot-password' ||
    path === '/auth/employee/reset-password' ||
    path === '/auth/customer/register' ||
    path === '/auth/employee/register' ||
    path === '/auth/customer/refresh' ||
    path === '/auth/employee/refresh' ||
    path.startsWith('/auth/customer/social/') ||
    path.startsWith('/auth/customer/email') ||
    path.startsWith('/employee/profile') ||
    path.startsWith('/customer/profile') ||
    path.startsWith('/customer/addresses') ||
    path.startsWith('/employee/sessions') ||
    path.startsWith('/cpanel')
  ) {
    return next();
  }
  return csrfProtection(req, res, next);
};

export const csrfErrorHandler = (err, _req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  res.status(403).json({ message: 'Invalid CSRF token' });
};
