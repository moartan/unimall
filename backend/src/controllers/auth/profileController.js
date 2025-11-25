import createError from 'http-errors';
import User from '../../models/auth/User.js';
import { logAction } from './authService.js';
import { uploadAvatar, deleteAsset } from '../../utils/cloudinary.js';
import fs from 'fs';

const buildSafeUser = (user) => {
  const { password, __v, ...rest } = user.toObject();
  return rest;
};

export const getProfile = async (req, res, next) => {
  try {
    res.json({ user: buildSafeUser(req.user) });
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
    if (user.provider !== 'local') throw createError(400, 'Password not managed for social login');
    const match = await user.comparePassword(currentPassword);
    if (!match) throw createError(401, 'Invalid current password');
    user.password = newPassword;
    await user.save();
    await logAction(user._id, 'password_changed', { ip: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ message: 'Password updated' });
  } catch (err) {
    next(err);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) throw createError(400, 'Avatar file is required');
    const { url, publicId } = await uploadAvatar(req.file.path);
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: url },
      { new: true, runValidators: true }
    );
    // cleanup temp file
    fs.unlink(req.file.path, () => {});
    // delete previous avatar if exists
    if (user.avatarPublicId) {
      await deleteAsset(user.avatarPublicId);
    }
    user.avatar = url;
    user.avatarPublicId = publicId;
    await user.save();
    await logAction(user._id, 'update_avatar', { ip: req.ip, userAgent: req.headers['user-agent'], metadata: { publicId } });
    res.json({ user: buildSafeUser(user), avatar: url });
  } catch (err) {
    next(err);
  }
};
