import createError from 'http-errors';
import Address from '../../models/customer/Address.js';
import { logAction } from '../auth/authService.js';

const MAX_ADDRESSES = 2;

const toSafe = (address) => address;

export const listAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, updatedAt: -1 });
    res.json({ addresses: addresses.map(toSafe) });
  } catch (err) {
    next(err);
  }
};

export const createAddress = async (req, res, next) => {
  try {
    const existingCount = await Address.countDocuments({ user: req.user._id });
    if (existingCount >= MAX_ADDRESSES) throw createError(400, 'Address limit reached (max 2)');

    const payload = { ...req.body, user: req.user._id };
    // If first address, force default true
    if (existingCount === 0) {
      payload.isDefault = true;
    }
    const address = await Address.create(payload);
    await logAction(req.user._id, 'address_created', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { addressId: address._id },
    });
    res.status(201).json({ address: toSafe(address) });
  } catch (err) {
    next(err);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const address = await Address.findOneAndUpdate(
      { _id: id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!address) throw createError(404, 'Address not found');
    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id, _id: { $ne: id } }, { $set: { isDefault: false } });
    }
    await logAction(req.user._id, 'address_updated', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { addressId: id },
    });
    res.json({ address: toSafe(address) });
  } catch (err) {
    next(err);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const address = await Address.findOneAndDelete({ _id: id, user: req.user._id });
    if (!address) throw createError(404, 'Address not found');
    await logAction(req.user._id, 'address_deleted', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { addressId: id },
    });
    res.json({ message: 'Address deleted' });
  } catch (err) {
    next(err);
  }
};
