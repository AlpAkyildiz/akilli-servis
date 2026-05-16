import { Router } from 'express';
import { createRoute, getRoutes, getMyRoutes, deleteRoute } from '../controllers/routeController';
import { authenticateToken } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';

const router = Router();

// Şoförün kendi rotalarını çektiği endpoint (en üste yazıyoruz ki /my statik eşleşsin)
router.get('/my', authenticateToken, authorizeRoles('DRIVER'), getMyRoutes);

router.post('/', authenticateToken, authorizeRoles('ADMIN'), createRoute);
router.get('/', authenticateToken, getRoutes);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteRoute);

export default router;
