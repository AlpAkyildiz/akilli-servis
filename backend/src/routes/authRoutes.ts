import { Router } from 'express';
import { registerParent, login, createStaff, getDrivers, deleteDriver, updatePassword } from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';

const router = Router();

router.post('/register', registerParent);
router.post('/login', login);

router.put('/password', authenticateToken, updatePassword);

router.get('/staff/drivers', authenticateToken, authorizeRoles('ADMIN'), getDrivers);

// Sadece yöneticiler şoför/admin oluşturabilir
router.post('/staff', authenticateToken, authorizeRoles('ADMIN'), createStaff);
router.delete('/staff/drivers/:id', authenticateToken, authorizeRoles('ADMIN'), deleteDriver);

export default router;
