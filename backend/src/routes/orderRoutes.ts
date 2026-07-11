import { Router } from 'express';
import { 
  createOrder, 
  getMyOrders, 
  getAllOrders, 
  updateOrderStatus, 
  getOrderInvoice 
} from '../controllers/orderController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

// 1. Customer Protected Routes (Requires active login)
router.post('/checkout', protect as any, createOrder as any);
router.get('/my-orders', protect as any, getMyOrders as any);
router.get('/:id/invoice', protect as any, getOrderInvoice as any);

// 2. Admin Only Protected Routes
router.get('/admin/all', [protect as any, adminOnly as any], getAllOrders as any);
router.put('/admin/status/:id', [protect as any, adminOnly as any], updateOrderStatus as any);

export default router;