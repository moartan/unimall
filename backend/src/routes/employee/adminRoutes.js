import express from 'express';
import { authGuard, requireRoles, requireEmployeeRoles } from '../../middleware/auth.js';
import { listCustomers, listEmployees, updateStatus, softDelete } from '../../controllers/auth/adminController.js';
import { createEmployee } from '../../controllers/auth/employeeAuthController.js';

const router = express.Router();

// Admin-only routes
router.use(authGuard, requireRoles('employee'), requireEmployeeRoles('admin'));

router.get('/customers', listCustomers);
router.get('/employees', listEmployees);
router.patch('/users/:id/status', updateStatus);
router.delete('/users/:id', softDelete);
router.post('/employees', createEmployee);

export default router;
