import { Router } from 'express';
import { createRoute, getRoutes } from '../controllers/routeController';
import { authenticateToken } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';

const router = Router();

router.post('/', authenticateToken, authorizeRoles('ADMIN'), createRoute);
router.get('/', authenticateToken, getRoutes);

export default router;
