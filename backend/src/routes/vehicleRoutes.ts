import { Router } from 'express';
import { createVehicle, getVehicles } from '../controllers/vehicleController';
import { authenticateToken } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';

const router = Router();

// Sadece yöneticiler araç ekleyebilir
router.post('/', authenticateToken, authorizeRoles('ADMIN'), createVehicle);
router.get('/', authenticateToken, getVehicles);

export default router;
