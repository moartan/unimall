import { v2 as cloudinary } from 'cloudinary';
import config from '../config/env.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadAvatar = async (filePath) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary not configured');
  }
  const res = await cloudinary.uploader.upload(filePath, {
    folder: 'unimall/avatars',
    overwrite: true,
    resource_type: 'image',
  });
  return { url: res.secure_url, publicId: res.public_id };
};

export const deleteAsset = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
};

export const uploadProductImages = async (files) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) throw new Error('Cloudinary not configured');
  const uploads = files.map((file) =>
    cloudinary.uploader.upload(file.path, {
      folder: 'unimall/products',
      resource_type: 'image',
    })
  );
  const results = await Promise.all(uploads);
  return results.map((r) => ({ url: r.secure_url, publicId: r.public_id }));
};
