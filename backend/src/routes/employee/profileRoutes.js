import express from 'express';
import { authGuard, requireRoles } from '../../middleware/auth.js';
import { getProfile, updateProfile, updatePassword, updateAvatar } from '../../controllers/auth/profileController.js';
import { uploadAvatarMiddleware } from '../../middleware/upload.js';

const router = express.Router();

router.use(authGuard, requireRoles('employee'));
router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/password', updatePassword);
router.put('/avatar', uploadAvatarMiddleware, updateAvatar);

export default router;
