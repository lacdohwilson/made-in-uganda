import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import eUserRole from '../utilities/enums/e.user-role.js';

const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword/:token', authController.resetPassword);
router.post('/refresh', authController.refreshToken);

// Protect this authentication routes
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);

router.post(
  '/register-store',
  authController.restrictTo(eUserRole.USER),
  authController.registerStore
);
router.post(
  '/pay-subscription',
  authController.restrictTo(eUserRole.USER),
  authController.paySubscription
);

export default router;
