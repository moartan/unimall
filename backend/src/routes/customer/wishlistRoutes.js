import express from 'express';
import { authGuard, requireRoles } from '../../middleware/auth.js';
import { getWishlist, addToWishlist, removeFromWishlist, clearWishlist } from '../../controllers/customer/wishlistController.js';

const router = express.Router();

router.use(authGuard, requireRoles('customer'));
router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:productId', removeFromWishlist);
router.delete('/', clearWishlist);

export default router;
