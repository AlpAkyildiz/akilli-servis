import { Router } from 'express';
import { registerParent, login, createStaff } from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';

const router = Router();

router.post('/register', registerParent);
router.post('/login', login);

// Sadece yöneticiler şoför/admin oluşturabilir
router.post('/staff', authenticateToken, authorizeRoles('ADMIN'), createStaff);

export default router;
