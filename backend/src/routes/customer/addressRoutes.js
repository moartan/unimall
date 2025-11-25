import express from 'express';
import { authGuard, requireRoles } from '../../middleware/auth.js';
import { listAddresses, createAddress, updateAddress, deleteAddress } from '../../controllers/customer/addressController.js';

const router = express.Router();

router.use(authGuard, requireRoles('customer'));
router.get('/', listAddresses);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

export default router;
