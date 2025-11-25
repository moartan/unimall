import express from 'express';
import { authGuard, requireRoles, requireEmployeeRoles } from '../../middleware/auth.js';
import { listAllOrders, updateOrderStatus, cancelOrderItems } from '../../controllers/order/orderController.js';

const router = express.Router();

router.use(authGuard, requireRoles('employee'));

router.get('/', listAllOrders);
router.put('/:id/status', requireEmployeeRoles('admin', 'staff'), updateOrderStatus);
router.post('/:id/items/cancel', requireEmployeeRoles('admin', 'staff'), cancelOrderItems);

export default router;
