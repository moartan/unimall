import express from 'express';
import { authGuard, requireRoles } from '../../middleware/auth.js';
import { getCart, addToCart, updateQuantity, removeFromCart, clearCart } from '../../controllers/customer/cartController.js';

const router = express.Router();

router.use(authGuard, requireRoles('customer'));
router.get('/', getCart);
router.post('/', addToCart);
router.put('/:productId', updateQuantity);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

export default router;
