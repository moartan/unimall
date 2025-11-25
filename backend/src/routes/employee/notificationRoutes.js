import express from 'express';
import { authGuard, requireRoles } from '../../middleware/auth.js';
import { listNotifications, markRead, markAllRead } from '../../controllers/notificationController.js';

const router = express.Router();

router.use(authGuard, requireRoles('employee'));
router.get('/', listNotifications);
router.post('/read-all', markAllRead);
router.post('/:id/read', markRead);

export default router;
