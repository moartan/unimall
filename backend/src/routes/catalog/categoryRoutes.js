import express from 'express';
import { listCategories } from '../../controllers/catalog/categoryController.js';

const router = express.Router();

// Public categories list (active/non-deleted)
router.get('/', listCategories);

export default router;
