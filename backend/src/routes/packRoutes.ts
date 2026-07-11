import { Router } from 'express';
import { createPack, getPacks, getPackById, deletePack } from '../controllers/packController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

// Public Routes
router.get('/', getPacks);
router.get('/single/:id', getPackById);

// Admin Only Routes
router.post('/', [protect as any, adminOnly as any], createPack);
router.delete('/:id', [protect as any, adminOnly as any], deletePack);

export default router;