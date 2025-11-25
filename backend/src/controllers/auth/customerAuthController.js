import crypto from 'crypto';
import createError from 'http-errors';
import dayjs from 'dayjs';
import User from '../../models/auth/User.js';
import EmailToken from '../../models/auth/EmailToken.js';
import Session from '../../models/auth/Session.js';
import { validatePasswordStrength } from '../../utils/validators.js';
import {
  createSession,
  issueTokens,
  rotateRefresh,
  setRefreshCookie,
  clearRefreshCookie,
  logAction,
  notify,
} from './authService.js';
import { sendEmail } from '../../utils/email.js';
import { hashToken, verifyRefreshToken } from '../../utils/tokens.js';
import config from '../../config/env.js';

const APP_URL = process.env.APP_BASE_URL || 'http://localhost:3000';

const buildSafeUser = (user) => {
  const { password, __v, ...rest } = user.toObject();
  return rest;
};

export const register = async (req, res, next) => {
  try {
    const { email, password, name, country, gender, phone, avatar } = req.body;
    if (!email || !password) throw createError(400, 'Email and password required');
    const existing = await User.findOne({ email });
    if (existing) throw createError(400, 'Email already registered');
    if (!validatePasswordStrength(password)) throw createError(400, 'Password too weak');
    const user = await User.create({
      email,
      password,
      name,
      country,
      gender,
      phone,
      avatar,
      role: 'customer',
      provider: 'local',
    });
    await logAction(user._id, 'customer_register', { ip: req.ip, userAgent: req.headers['user-agent'] });
    await notify(user._id, { title: 'Welcome to Unimall', body: 'Thanks for joining Unimall!' });
    const { accessToken, refreshToken } = issueTokens(user, null);
    const session = await createSession(user._id, refreshToken, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      metadata: { type: 'login_local' },
    });
    const rotatedTokens = issueTokens(user, session._id);
    session.refreshTokenHash = hashToken(rotatedTokens.refreshToken);
    await session.save();
    setRefreshCookie(res, rotatedTokens.refreshToken);
    res.status(201).json({ user: buildSafeUser(user), accessToken: rotatedTokens.accessToken });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw createError(400, 'Email and password required');
    const user = await User.findOne({ email, role: 'customer', isDeleted: { $ne: true } });
    if (!user || user.provider !== 'local') throw createError(401, 'Invalid credentials');
    if (user.status === 'block') throw createError(403, 'Account blocked');
    const match = await user.comparePassword(password);
    if (!match) throw createError(401, 'Invalid credentials');
    const { accessToken, refreshToken } = issueTokens(user, null);
    const session = await createSession(user._id, refreshToken, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      metadata: { type: 'login_local' },
    });
    const rotated = issueTokens(user, session._id);
    session.refreshTokenHash = hashToken(rotated.refreshToken);
    await session.save();
    setRefreshCookie(res, rotated.refreshToken);
    await logAction(user._id, 'customer_login', { ip: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ user: buildSafeUser(user), accessToken: rotated.accessToken });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies[config.cookies.refreshName];
    if (!token) throw createError(401, 'No refresh token');
    const { accessToken, refreshToken, session } = await rotateRefresh(token, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });
    setRefreshCookie(res, refreshToken);
    await logAction(session.user, 'refresh_token', { ip: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies[config.cookies.refreshName];
    clearRefreshCookie(res);
    if (token) {
      const decoded = verifyRefreshToken(token);
      await EmailToken.deleteMany({ user: decoded.sub, type: 'reset' });
      await Session.deleteOne({ _id: decoded.sid });
      await logAction(decoded.sub, 'logout', { ip: req.ip, userAgent: req.headers['user-agent'] });
    }
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, gender, country, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, gender, country, phone, avatar },
      { new: true, runValidators: true }
    );
    await logAction(user._id, 'update_profile', { ip: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ user: buildSafeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) throw createError(400, 'Passwords required');
    const user = await User.findById(req.user._id);
    const match = await user.comparePassword(currentPassword);
    if (!match) throw createError(401, 'Invalid current password');
    if (!validatePasswordStrength(newPassword)) throw createError(400, 'Password too weak');
    user.password = newPassword;
    await user.save();
    await logAction(user._id, 'password_changed', { ip: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ message: 'Password updated' });
  } catch (err) {
    next(err);
  }
};

export const requestEmailVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.email) throw createError(400, 'Email required');
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = dayjs().add(1, 'day').toDate();
    await EmailToken.create({
      user: user._id,
      tokenHash,
      email: user.email,
      type: 'verify',
      expiresAt,
    });
    const verifyLink = `${APP_URL}/verify-email?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: 'Verify your email',
      html: `<p>Please verify your email by clicking <a href="${verifyLink}">here</a>. Link expires in 24 hours.</p>`,
    });
    res.json({ message: 'Verification email sent' });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) throw createError(400, 'Token required');
    const tokenHash = hashToken(token);
    const record = await EmailToken.findOne({ tokenHash, type: 'verify' });
    if (!record) throw createError(400, 'Invalid or expired token');
    const user = await User.findById(record.user);
    user.emailVerified = true;
    user.isVerified = true;
    user.isVerify = true;
    await user.save();
    await record.deleteOne();
    await logAction(user._id, 'email_verified', { ip: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ message: 'Email verified' });
  } catch (err) {
    next(err);
  }
};

export const requestEmailChange = async (req, res, next) => {
  try {
    const { newEmail } = req.body;
    if (!newEmail) throw createError(400, 'New email required');
    const existing = await User.findOne({ email: newEmail.toLowerCase() });
    if (existing) throw createError(400, 'Email already in use');
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = dayjs().add(1, 'day').toDate();
    await EmailToken.create({
      user: req.user._id,
      tokenHash,
      email: newEmail,
      type: 'change',
      expiresAt,
    });
    const link = `${APP_URL}/confirm-email-change?token=${token}`;
    await sendEmail({
      to: newEmail,
      subject: 'Confirm your new email',
      html: `<p>Confirm your new email by clicking <a href="${link}">here</a>. Link expires in 24 hours.</p>`,
    });
    res.json({ message: 'Change email link sent' });
  } catch (err) {
    next(err);
  }
};

export const confirmEmailChange = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) throw createError(400, 'Token required');
    const tokenHash = hashToken(token);
    const record = await EmailToken.findOne({ tokenHash, type: 'change' });
    if (!record) throw createError(400, 'Invalid or expired token');
    const user = await User.findById(record.user);
    user.email = record.email;
    user.emailVerified = false;
    user.isVerified = false;
    user.isVerify = false;
    await user.save();
    await EmailToken.deleteMany({ user: user._id, type: 'change' });
    await logAction(user._id, 'email_changed', { metadata: { email: record.email }, ip: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ message: 'Email updated, please verify new email.' });
  } catch (err) {
    next(err);
  }
};

export const addEmailForSocial = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw createError(400, 'Email required');
    if (req.user.email) throw createError(400, 'Email already set');
    const existing = await User.findOne({ email });
    if (existing) throw createError(400, 'Email already in use');
    req.user.email = email;
    req.user.emailVerified = false;
    req.user.isVerified = false;
    await req.user.save();
    res.json({ user: buildSafeUser(req.user) });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw createError(400, 'Email required');
    const user = await User.findOne({ email, role: 'customer' });
    if (!user) throw createError(404, 'User not found');
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = dayjs().add(1, 'hour').toDate();
    await EmailToken.create({
      user: user._id,
      tokenHash,
      email: user.email,
      type: 'reset',
      expiresAt,
    });
    const resetLink = `${APP_URL}/reset-password?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: 'Reset your password',
      html: `<p>Reset your password by clicking <a href="${resetLink}">here</a>. Link expires in 1 hour.</p>`,
    });
    res.json({ message: 'Reset email sent' });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) throw createError(400, 'Token and new password required');
    if (!validatePasswordStrength(newPassword)) throw createError(400, 'Password too weak');
    const tokenHash = hashToken(token);
    const record = await EmailToken.findOne({ tokenHash, type: 'reset' });
    if (!record) throw createError(400, 'Invalid or expired token');
    const user = await User.findById(record.user);
    user.password = newPassword;
    await user.save();
    await EmailToken.deleteMany({ user: user._id, type: 'reset' });
    await logAction(user._id, 'password_reset', { ip: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ message: 'Password reset' });
  } catch (err) {
    next(err);
  }
};
