import express from 'express';
import { listPublishedProducts, getProduct } from '../../controllers/catalog/productController.js';

const router = express.Router();

router.get('/', listPublishedProducts);
router.get('/:idOrSlug', getProduct);

export default router;
