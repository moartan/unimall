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
    // In production we must allow cross-site cookies for the frontend domain
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
