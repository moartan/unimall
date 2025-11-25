import express from 'express';
import { authGuard, requireRoles } from '../../middleware/auth.js';
import { createOrderFromCart, listMyOrders, getMyOrder, requestRefund, cancelMyOrder } from '../../controllers/order/orderController.js';

const router = express.Router();

router.use(authGuard, requireRoles('customer'));
router.post('/', createOrderFromCart);
router.get('/', listMyOrders);
router.get('/:id', getMyOrder);
router.post('/:id/refund', requestRefund);
router.post('/:id/cancel', cancelMyOrder);

export default router;
