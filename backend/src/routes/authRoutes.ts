import { Router } from 'express';
import { registerParent, login, createStaff, getDrivers } from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';

const router = Router();

router.post('/register', registerParent);
router.post('/login', login);

router.get('/staff/drivers', authenticateToken, authorizeRoles('ADMIN'), getDrivers);

// Sadece yöneticiler şoför/admin oluşturabilir
router.post('/staff', authenticateToken, authorizeRoles('ADMIN'), createStaff);

export default router;
