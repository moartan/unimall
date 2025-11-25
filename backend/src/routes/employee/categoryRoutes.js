import express from 'express';
import { authGuard, requireRoles, requireEmployeeRoles } from '../../middleware/auth.js';
import {
  createCategory,
  updateCategory,
  listCategories,
  getCategory,
  softDeleteCategory,
  listDeletedCategories,
  restoreCategory,
} from '../../controllers/catalog/categoryController.js';
const router = express.Router();

router.use(authGuard, requireRoles('employee'));

router.get('/', listCategories);
router.get('/deleted/list', requireEmployeeRoles('admin'), listDeletedCategories);
router.get('/:id', getCategory);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', requireEmployeeRoles('admin'), softDeleteCategory);
router.post('/:id/restore', requireEmployeeRoles('admin'), restoreCategory);

export default router;
