import express from 'express';
import {
  register,
  login,
  refresh,
  logout,
  requestEmailVerification,
  verifyEmail,
  addEmailForSocial,
  forgotPassword,
  resetPassword,
  requestEmailChange,
  confirmEmailChange,
} from '../../controllers/auth/customerAuthController.js';
import { authGuard } from '../../middleware/auth.js';
import { socialStart, socialCallback } from '../../controllers/auth/socialAuthController.js';
import { loginRateLimiter } from '../../middleware/loginRateLimit.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', loginRateLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/email/verify', authGuard, requestEmailVerification);
router.post('/email/confirm', authGuard, verifyEmail);
router.post('/email/add', authGuard, addEmailForSocial);
router.post('/email/change', authGuard, requestEmailChange);
router.post('/email/confirm-change', confirmEmailChange);

router.get('/social/:provider/start', socialStart);
router.get('/social/:provider/callback', socialCallback);

export default router;
