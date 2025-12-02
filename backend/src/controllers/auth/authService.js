import dayjs from 'dayjs';
import createError from 'http-errors';
import {
  signAccessToken,
  signRefreshToken,
  hashToken,
  verifyRefreshToken,
} from '../../utils/tokens.js';
import Session from '../../models/auth/Session.js';
import AuditLog from '../../models/auth/AuditLog.js';
import Notification from '../../models/common/Notification.js';
import config from '../../config/env.js';

const cookiePathByName = (cookieName) => {
  if (cookieName === config.cookies.employeeRefreshName) return '/auth/employee';
  return '/auth/customer';
};

export const setRefreshCookie = (res, token, cookieName) => {
  const name = cookieName || config.cookies.customerRefreshName;
  res.cookie(name, token, {
    httpOnly: true,
    secure: config.cookies.secure,
    sameSite: config.cookies.sameSite,
    maxAge: config.jwt.refreshExpiresInMs,
    path: cookiePathByName(name),
  });
};

export const clearRefreshCookie = (res, cookieName) => {
  const name = cookieName || config.cookies.customerRefreshName;
  res.clearCookie(name, { path: cookiePathByName(name) });
};

export const createSession = async (userId, refreshToken, { userAgent, ip, metadata } = {}) => {
  const session = await Session.create({
    user: userId,
    refreshTokenHash: hashToken(refreshToken),
    userAgent,
    ip,
    metadata,
    expiresAt: dayjs().add(config.jwt.refreshExpiresInMs, 'millisecond').toDate(),
  });
  return session;
};

export const logAction = (userId, action, { userAgent, ip, metadata } = {}) =>
  AuditLog.create({ user: userId, action, userAgent, ip, metadata });

export const notify = (userId, { title, body, metadata }) =>
  Notification.create({ user: userId, title, body, metadata });

export const issueTokens = (user, sessionId) => {
  const basePayload = { sub: user._id.toString(), role: user.role, employeeRole: user.employeeRole };
  const accessToken = signAccessToken(basePayload);
  const refreshToken = signRefreshToken({ ...basePayload, sid: sessionId });
  return { accessToken, refreshToken };
};

export const rotateRefresh = async (token, reqMeta) => {
  try {
    const decoded = verifyRefreshToken(token);
    const session = await Session.findById(decoded.sid);
    if (!session) throw createError(401, 'Session expired');
    if (session.expiresAt < new Date()) throw createError(401, 'Session expired');
    if (session.refreshTokenHash !== hashToken(token)) {
      await session.deleteOne();
      throw createError(401, 'Session invalidated');
    }
    session.lastUsedAt = new Date();
    await session.save();
    const { accessToken, refreshToken } = issueTokens(
      { _id: decoded.sub, role: decoded.role, employeeRole: decoded.employeeRole },
      session._id
    );
    session.refreshTokenHash = hashToken(refreshToken);
    session.expiresAt = dayjs().add(config.jwt.refreshExpiresInMs, 'millisecond').toDate();
    session.userAgent = reqMeta.userAgent;
    session.ip = reqMeta.ip;
    await session.save();
    return { accessToken, refreshToken, session };
  } catch (err) {
    throw createError(401, err.message || 'Invalid refresh token');
  }
};
