// backend/src/routes/productRoutes.ts
import { Router } from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  getRecommendations 
} from '../controllers/productController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

// Public Routes (Anyone can browse products)
router.get('/', getProducts);
router.get('/single/:id', getProductById);

// Protected Recommendation Route (Requires being logged-in)
router.get('/recommendations', protect as any, getRecommendations as any);

// Protected Admin Routes (Require being logged-in AND having the ADMIN role)
router.post('/', [protect as any, adminOnly as any], createProduct);
router.put('/:id', [protect as any, adminOnly as any], updateProduct);
router.delete('/:id', [protect as any, adminOnly as any], deleteProduct);

export default router;