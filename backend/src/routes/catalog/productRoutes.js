import express from 'express';
import { listPublishedProducts, getProduct, trackProductView } from '../../controllers/catalog/productController.js';

const router = express.Router();

router.get('/', listPublishedProducts);
router.get('/:idOrSlug', getProduct);
router.post('/:idOrSlug/view', trackProductView);

export default router;
