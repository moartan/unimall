import dotenv from 'dotenv';

dotenv.config();

const REQUIRED_VARS = ['JWT_SECRET', 'REFRESH_TOKEN_SECRET', 'MONGO_URI'];

const validateEnv = () => {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

validateEnv();

const isProd = process.env.NODE_ENV === 'production';
const appUrl = process.env.APP_BASE_URL || '';

// Decide cookie security based on explicit env, otherwise infer from app URL.
// Using "https" app URL -> secure cookies; "http" -> insecure; otherwise default to false to avoid dropped cookies on HTTP.
const resolveCookieSecure = () => {
  if (process.env.COOKIES_SECURE === 'true') return true;
  if (process.env.COOKIES_SECURE === 'false') return false;
  if (appUrl.startsWith('https://')) return true;
  if (appUrl.startsWith('http://')) return false;
  return false;
};

const resolvedCookieSecure = resolveCookieSecure();
const resolvedSameSite = process.env.COOKIES_SAMESITE || (resolvedCookieSecure ? 'none' : 'lax');

const config = {
  // Pick a non-conflicting default port; override via PORT env if needed
  port: process.env.PORT || 8081,
  mongoUri: process.env.MONGO_URI,
  jwt: {
    accessSecret: process.env.JWT_SECRET,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    accessExpiresIn: '15m',
    refreshExpiresInMs: 24 * 60 * 60 * 1000, // 24 hours
  },
  cookies: {
    customerRefreshName: 'customerRefreshToken',
    employeeRefreshName: 'employeeRefreshToken',
    // Infer secure/sameSite from env or APP_BASE_URL; can override via COOKIES_SECURE / COOKIES_SAMESITE.
    secure: resolvedCookieSecure,
    sameSite: resolvedSameSite,
  },
  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'no-reply@unimall.com',
  },
};

export default config;
