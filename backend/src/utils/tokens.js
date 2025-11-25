import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';

export const signAccessToken = (payload) =>
  jwt.sign(payload, config.jwt.accessSecret, { expiresIn: config.jwt.accessExpiresIn });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: Math.floor(config.jwt.refreshExpiresInMs / 1000),
  });

export const verifyAccessToken = (token) => jwt.verify(token, config.jwt.accessSecret);
export const verifyRefreshToken = (token) => jwt.verify(token, config.jwt.refreshSecret);

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
