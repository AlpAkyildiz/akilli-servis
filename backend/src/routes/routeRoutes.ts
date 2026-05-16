import { Router } from 'express';
import { createRoute, getRoutes, getMyRoutes } from '../controllers/routeController';
import { authenticateToken } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';

const router = Router();

// Şoförün kendi rotalarını çektiği endpoint (en üste yazıyoruz ki /my statik eşleşsin)
router.get('/my', authenticateToken, authorizeRoles('DRIVER'), getMyRoutes);

router.post('/', authenticateToken, authorizeRoles('ADMIN'), createRoute);
router.get('/', authenticateToken, getRoutes);

export default router;
