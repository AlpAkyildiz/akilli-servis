import { Router } from 'express';
import { createStudent, approveStudent, deleteStudent, getStudents } from '../controllers/studentController';
import { authenticateToken } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';

const router = Router();

// Sadece giriş yapmış kullanıcılar (Admin veya Veli) öğrencileri görebilir
router.get('/', authenticateToken, authorizeRoles('ADMIN', 'PARENT'), getStudents);

// Veli öğrenci ekleyebilir
router.post('/', authenticateToken, authorizeRoles('PARENT'), createStudent);

// Sadece Admin onaylayabilir veya silebilir
router.put('/:id/approve', authenticateToken, authorizeRoles('ADMIN'), approveStudent);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteStudent);

export default router;
