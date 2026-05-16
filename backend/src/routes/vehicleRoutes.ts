import { Router } from 'express';
import { createVehicle, getVehicles, deleteVehicle } from '../controllers/vehicleController';
import { authenticateToken } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';

const router = Router();

// Sadece yöneticiler araç ekleyebilir
router.post('/', authenticateToken, authorizeRoles('ADMIN'), createVehicle);
router.get('/', authenticateToken, getVehicles);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteVehicle);

export default router;
