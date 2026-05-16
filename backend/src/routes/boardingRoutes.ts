import { Router } from 'express';
import {
  getStudentsForDriver,
  markBoarded,
  markDroppedOff,
  markAbsent,
  getStudentTripStatus,
  getMyNotifications
} from '../controllers/boardingController';
import { authenticateToken } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';

const router = Router();

// Şoför: tüm onaylı öğrencileri gör
router.get('/students', authenticateToken, authorizeRoles('DRIVER'), getStudentsForDriver);

// Şoför: öğrenciyi servise al / indir / devamsız kaydet
router.post('/board', authenticateToken, authorizeRoles('DRIVER'), markBoarded);
router.post('/dropoff', authenticateToken, authorizeRoles('DRIVER'), markDroppedOff);
router.post('/absent', authenticateToken, authorizeRoles('DRIVER'), markAbsent);

// Veli: öğrencisinin durumunu öğren
router.get('/status/:studentId', authenticateToken, authorizeRoles('PARENT'), getStudentTripStatus);

// Veli: bildirimleri
router.get('/notifications', authenticateToken, authorizeRoles('PARENT'), getMyNotifications);

export default router;
