import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image uploads are allowed'), false);
  }
  cb(null, true);
};

export const uploadAvatarMiddleware = multer({ storage, fileFilter }).single('avatar');
