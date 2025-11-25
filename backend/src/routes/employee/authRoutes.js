import express from 'express';
import {
  createEmployee,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  requestEmailChange,
  confirmEmailChange,
} from '../../controllers/auth/employeeAuthController.js';
import { authGuard, requireRoles, requireEmployeeRoles } from '../../middleware/auth.js';
import { loginRateLimiter } from '../../middleware/loginRateLimit.js';

const router = express.Router();

router.post('/login', loginRateLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/email/change', authGuard, requestEmailChange);
router.post('/email/confirm-change', confirmEmailChange);

router.post('/create', authGuard, requireRoles('employee'), requireEmployeeRoles('admin'), createEmployee);

export default router;
