import csrf from 'csurf';
import config from '../config/env.js';

// Using cookies for csrf token storage; must be used after cookie-parser
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: config.cookies.sameSite || 'lax',
    secure: config.cookies.secure,
    path: '/',
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
});

// Skip CSRF only for auth bootstrap and public GET-only routes.
const CSRF_EXEMPT_PATHS = new Set([
  '/auth/customer/login',
  '/auth/employee/login',
  '/auth/customer/logout',
  '/auth/employee/logout',
  '/auth/customer/forgot-password',
  '/auth/employee/forgot-password',
  '/auth/customer/reset-password',
  '/auth/employee/reset-password',
  '/auth/customer/register',
  '/auth/employee/register',
  '/auth/customer/refresh',
  '/auth/employee/refresh',
]);

export const csrfSkip = (req, res, next) => {
  const path = req.path || '';
  if (
    CSRF_EXEMPT_PATHS.has(path) ||
    path.startsWith('/auth/customer/social/') ||
    path.startsWith('/auth/customer/email') ||
    path.startsWith('/catalog')
  ) {
    return next();
  }
  return csrfProtection(req, res, next);
};

export const csrfErrorHandler = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  // Log minimal context to help debug noisy CSRF failures without leaking sensitive data
  console.warn('CSRF validation failed', {
    path: req.path,
    method: req.method,
    origin: req.headers.origin,
    referer: req.headers.referer,
    hasCsrfCookie: Boolean(req.cookies?._csrf),
    hasHeader: Boolean(req.headers['x-csrf-token']),
  });
  res.status(403).json({ message: 'Invalid CSRF token' });
};
