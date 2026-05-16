import { Router } from 'express';
import { createStudent, approveStudent, getStudents } from '../controllers/studentController';
import { authenticateToken } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';

const router = Router();

// Sadece giriş yapmış kullanıcılar (Admin veya Veli) öğrencileri görebilir
router.get('/', authenticateToken, authorizeRoles('ADMIN', 'PARENT'), getStudents);

// Veli öğrenci ekleyebilir
router.post('/', authenticateToken, authorizeRoles('PARENT'), createStudent);

// Sadece Admin onaylayabilir
router.put('/:id/approve', authenticateToken, authorizeRoles('ADMIN'), approveStudent);

export default router;
