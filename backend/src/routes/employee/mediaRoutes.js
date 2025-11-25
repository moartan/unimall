import express from 'express';
import { authGuard, requireRoles, requireEmployeeRoles } from '../../middleware/auth.js';
import { uploadProductGallery, deleteProductImage } from '../../controllers/catalog/mediaController.js';
import { uploadMultipleImages } from '../../middleware/uploadImages.js';

const router = express.Router();

router.use(authGuard, requireRoles('employee'));
router.post('/products', uploadMultipleImages, uploadProductGallery);
router.delete('/products', requireEmployeeRoles('admin'), deleteProductImage);

export default router;
