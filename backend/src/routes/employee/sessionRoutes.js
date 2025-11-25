import express from 'express';
import Session from '../../models/auth/Session.js';
import { authGuard, requireRoles } from '../../middleware/auth.js';
import { logAction } from '../../controllers/auth/authService.js';

const router = express.Router();

router.use(authGuard, requireRoles('employee'));

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;
    const [sessions, total] = await Promise.all([
      Session.find({ user: req.user._id }).sort({ lastUsedAt: -1 }).skip(skip).limit(limit),
      Session.countDocuments({ user: req.user._id }),
    ]);
    res.json({ sessions, page, limit, total });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await Session.deleteOne({ _id: id, user: req.user._id });
    await logAction(req.user._id, 'session_revoked', { ip: req.ip, userAgent: req.headers['user-agent'], metadata: { session: id } });
    res.json({ message: 'Session revoked' });
  } catch (err) {
    next(err);
  }
});

export default router;
