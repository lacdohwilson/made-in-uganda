import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import categoryController from '../controllers/category.controller.js';
import eUserRole from '../utilities/enums/e.user-role.js';
import productRouter from './product.routes.js';

const router = Router();

// POST /category/234fad4/products
// GET /category/234fad4/products
router.use('/:categoryId/products', productRouter);

router.get('/search', categoryController.searchCategory);
router.get('/count', categoryController.getCategoryCount);

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo(eUserRole.ADMIN),
    categoryController.createCategory
  )
  .get(categoryController.getAllCategories);

router
  .route('/:id')
  .get(categoryController.getCategory)
  .patch(
    authController.protect,
    authController.restrictTo(eUserRole.ADMIN),
    categoryController.updateCategory
  )
  .delete(
    authController.protect,
    authController.restrictTo(eUserRole.ADMIN),
    categoryController.deleteCategory
  );

export default router;
