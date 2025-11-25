import express from 'express';
import { authGuard, requireRoles, requireEmployeeRoles } from '../../middleware/auth.js';
import {
  createProduct,
  updateProduct,
  listProducts,
  getProduct,
  softDeleteProduct,
  listDeletedProducts,
  restoreProduct,
  addVariant,
  updateVariant,
  deleteVariant,
} from '../../controllers/catalog/productController.js';
const router = express.Router();

router.use(authGuard, requireRoles('employee'));

router.get('/', listProducts);
router.get('/deleted/list', requireEmployeeRoles('admin'), listDeletedProducts);
router.get('/:idOrSlug', getProduct);
router.post('/', createProduct);
router.put('/:idOrSlug', updateProduct);
router.delete('/:idOrSlug', requireEmployeeRoles('admin'), softDeleteProduct);
router.post('/:idOrSlug/restore', requireEmployeeRoles('admin'), restoreProduct);
router.post('/:id/variants', addVariant);
router.put('/:id/variants/:variantIndex', updateVariant);
router.delete('/:id/variants/:variantIndex', deleteVariant);

export default router;
