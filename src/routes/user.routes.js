import { Router } from 'express';

import authController from '../controllers/auth.controller.js';
import userController from '../controllers/user.controller.js';
import eUserRole from '../utilities/enums/e.user-role.js';

const router = Router();

// PROTECT ALL ROUTE AFTER THIS MIDDLEWARE
router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.patch('/deleteMe', userController.deleteMe);

// Restrict all route after this to admin
router.use(authController.restrictTo(eUserRole.ADMIN));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
