import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, '/tmp'),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const imageFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only images allowed'), false);
  }
  cb(null, true);
};

export const uploadMultipleImages = multer({ storage, fileFilter: imageFilter }).array('images', 20);
