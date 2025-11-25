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
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwt: {
    accessSecret: process.env.JWT_SECRET,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    accessExpiresIn: '15m',
    refreshExpiresInMs: 24 * 60 * 60 * 1000, // 24 hours
  },
  cookies: {
    refreshName: 'refreshToken',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
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
