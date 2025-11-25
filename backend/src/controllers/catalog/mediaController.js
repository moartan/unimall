import fs from 'fs';
import createError from 'http-errors';
import { uploadProductImages, deleteAsset } from '../../utils/cloudinary.js';

export const uploadProductGallery = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) throw createError(400, 'No images uploaded');
    if (req.files.length > 20) throw createError(400, 'Maximum 20 images allowed');
    const uploaded = await uploadProductImages(req.files);
    req.files.forEach((f) => fs.unlink(f.path, () => {}));
    res.status(201).json({ images: uploaded });
  } catch (err) {
    next(err);
  }
};

export const deleteProductImage = async (req, res, next) => {
  try {
    const { publicId } = req.body;
    if (!publicId) throw createError(400, 'publicId required');
    await deleteAsset(publicId);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};
