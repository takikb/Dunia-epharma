// backend/src/routes/adminRoutes.ts
import { Router } from 'express';
import { 
  getAdminOverviewStats, 
  getSalesPerformanceOverTime, 
  getBestSellingProducts, 
  getLowStockAlerts, 
  getCustomerDemographics, 
  getCustomerDirectory 
} from '../controllers/adminController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

// Apply global security rules to all sub-routes inside this file
router.use(protect as any);
router.use(adminOnly as any);

// Analytics & Dashboard Endpoints
router.get('/overview', getAdminOverviewStats);
router.get('/sales-timeline', getSalesPerformanceOverTime);
router.get('/best-sellers', getBestSellingProducts);
router.get('/low-stock', getLowStockAlerts);
router.get('/customer-demographics', getCustomerDemographics);
router.get('/customers', getCustomerDirectory);

export default router;