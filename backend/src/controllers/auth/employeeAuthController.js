import createError from 'http-errors';
import crypto from 'crypto';
import dayjs from 'dayjs';
import User from '../../models/auth/User.js';
import Session from '../../models/auth/Session.js';
import {
  createSession,
  issueTokens,
  rotateRefresh,
  setRefreshCookie,
  clearRefreshCookie,
  logAction,
  notify,
} from './authService.js';
import { hashToken, verifyRefreshToken } from '../../utils/tokens.js';
import config from '../../config/env.js';
import EmailToken from '../../models/auth/EmailToken.js';
import { sendEmail } from '../../utils/email.js';
import { validatePasswordStrength } from '../../utils/validators.js';

const APP_URL = process.env.APP_BASE_URL || 'http://localhost:5173';
const buildCpanelUrl = (req) => {
  if (process.env.CPANEL_BASE_URL) return process.env.CPANEL_BASE_URL;
  const origin = req?.headers?.origin;
  if (origin) return `${origin.replace(/\/$/, '')}/cpanel`;
  return `${APP_URL}/cpanel`;
};

const buildSafeUser = (user) => {
  const { password, __v, ...rest } = user.toObject();
  return rest;
};

export const createEmployee = async (req, res, next) => {
  try {
    const { email, password, employeeRole, name, phone, avatar, country, gender } = req.body;
    if (!email || !employeeRole) throw createError(400, 'Email and role required');
    if (!['admin', 'staff'].includes(employeeRole)) throw createError(400, 'Invalid employee role');
    const existing = await User.findOne({ email });
    if (existing) throw createError(400, 'Email already registered');

    const passwordToUse =
      password && password.trim().length
        ? password
        : `Aa1!${crypto.randomBytes(8).toString('base64url')}`;
    if (!validatePasswordStrength(passwordToUse)) throw createError(400, 'Password too weak');

    const user = await User.create({
      email,
      password: passwordToUse,
      role: 'employee',
      provider: 'local',
      employeeRole,
      name,
      phone,
      avatar,
      country,
      gender,
      emailVerified: true,
    });
    await logAction(req.user._id, 'create_employee', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { createdUser: user._id, role: employeeRole },
    });
    await notify(user._id, { title: 'Welcome to Unimall', body: 'Your employee account is ready.' });

    // If password was not provided, send reset link so the employee can set their own
    if (!password || !password.trim().length) {
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashToken(token);
      const expiresAt = dayjs().add(1, 'day').toDate();
      await EmailToken.create({
        user: user._id,
        tokenHash,
        email: user.email,
        type: 'reset',
        expiresAt,
      });
      const resetLink = `${buildCpanelUrl(req)}/reset-password/${token}`;
      await sendEmail({
        to: user.email,
        subject: 'Set your Unimall password',
        html: `<p>Welcome to Unimall. Click <a href="${resetLink}">here</a> to set your password. Link expires in 24 hours.</p>`,
      });
    }

    res.status(201).json({ user: buildSafeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw createError(400, 'Email and password required');
    const user = await User.findOne({ email, role: 'employee', isDeleted: { $ne: true } });
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
    setRefreshCookie(res, rotated.refreshToken, config.cookies.employeeRefreshName);
    await logAction(user._id, 'employee_login', { ip: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ user: buildSafeUser(user), accessToken: rotated.accessToken });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies[config.cookies.employeeRefreshName];
    if (!token) throw createError(401, 'No refresh token');
    const { accessToken, refreshToken, session } = await rotateRefresh(token, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });
    setRefreshCookie(res, refreshToken, config.cookies.employeeRefreshName);
    await logAction(session.user, 'refresh_token', { ip: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies[config.cookies.employeeRefreshName];
    clearRefreshCookie(res, config.cookies.employeeRefreshName);
    if (token) {
      const decoded = verifyRefreshToken(token);
      await Session.deleteOne({ _id: decoded.sid });
      await logAction(decoded.sub, 'logout', { ip: req.ip, userAgent: req.headers['user-agent'] });
      return res.json({ message: 'Logged out' });
    }
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw createError(400, 'Email required');
    const user = await User.findOne({ email, role: 'employee' });
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
    const resetLink = `${buildCpanelUrl(req)}/reset-password/${token}`;
    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset your password',
        html: `<p>Reset your password by clicking <a href="${resetLink}">here</a>. Link expires in 1 hour.</p>`,
      });
      res.json({ message: 'Reset email sent' });
    } catch (emailErr) {
      console.error('Failed to send employee reset email', emailErr);
      if (process.env.NODE_ENV !== 'production' || process.env.EMAIL_DEBUG_LINK === '1') {
        return res.json({
          message: 'Reset email (debug mode)',
          debugResetLink: resetLink,
        });
      }
      throw emailErr;
    }
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
    const link = `${buildCpanelUrl(req)}/confirm-email-change?token=${token}`;
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
    await user.save();
    await EmailToken.deleteMany({ user: user._id, type: 'change' });
    await logAction(user._id, 'email_changed', { metadata: { email: record.email }, ip: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ message: 'Email updated, please verify new email.' });
  } catch (err) {
    next(err);
  }
};
