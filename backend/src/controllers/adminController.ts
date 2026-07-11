// backend/src/controllers/adminController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Order from '../models/order';
import Product from '../models/product';
import User from '../models/user';

// 1. GET MAIN OVERVIEW CARD METRICS (Overview Stats)
export const getAdminOverviewStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // A. Total Revenue (from DELIVERED orders only)
    const revenueAggregation = await Order.aggregate([
      { $match: { status: 'DELIVERED' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAggregation[0]?.total || 0;

    // B. Total Checkout Count (all orders placed)
    const totalCheckouts = await Order.countDocuments();

    // C. Total Registered Customers
    const totalCustomers = await User.countDocuments({ role: 'CUSTOMER' });

    // D. Low Stock Alerts Count
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] }
    });

    res.status(200).json({
      totalRevenue,
      totalCheckouts,
      totalCustomers,
      lowStockCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error compiling overview statistics', error });
  }
};

// 2. GET REVENUE & CHECKOUTS OVER TIME (For Frontend Line/Bar Charts)
// Supports optional startDate and endDate query filters (e.g. last 7 days, 30 days)
export const getSalesPerformanceOverTime = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    // Default to last 30 days if no range provided
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const salesPerformance = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: start, $lte: end } 
        } 
      },
      {
        $group: {
          // Group by Date string: "YYYY-MM-DD"
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "DELIVERED"] }, "$totalAmount", 0] 
            } 
          },
          checkouts: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Sort Chronologically
    ]);

    // Format output for direct chart integration
    const chartData = salesPerformance.map(item => ({
      date: item._id,
      revenue: item.revenue,
      checkouts: item.checkouts
    }));

    res.status(200).json({
      timeFrame: { start, end },
      chartData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving sales performance timeline', error });
  }
};

// 3. GET POPULAR & BEST SELLING PRODUCTS
export const getBestSellingProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bestSellers = await Order.aggregate([
      { $match: { status: 'DELIVERED' } }, // Only count completed sales
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalQuantitySold: { $sum: "$items.quantity" },
          totalRevenueGenerated: { 
            $sum: { $multiply: ["$items.priceAtPurchase", "$items.quantity"] } 
          }
        }
      },
      { $sort: { totalQuantitySold: -1 } }, // Sort by most quantity sold
      { $limit: 5 }, // Top 5 best sellers
      {
        // Join with products collection to get product metadata (name, image)
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          _id: 1,
          totalQuantitySold: 1,
          totalRevenueGenerated: 1,
          name: "$productDetails.name",
          imageUrl: "$productDetails.imageUrl",
          currentPrice: "$productDetails.price"
        }
      }
    ]);

    res.status(200).json(bestSellers);
  } catch (error) {
    res.status(500).json({ message: 'Error compiling best sellers', error });
  }
};

// 4. GET LOW STOCK PRODUCTS LIST (Low Stock Alerts)
export const getLowStockAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] }
    }).sort({ stockQuantity: 1 }); // Urgency first (lowest stock on top)

    res.status(200).json(lowStockProducts);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving low stock list', error });
  }
};

// 5. GET CUSTOMER PROFILES STATISTICAL DEMOGRAPHICS (Skin/Hair/Allergies Breakdown)
export const getCustomerDemographics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // A. Skin Type Breakdown
    const skinTypeStats = await User.aggregate([
      { $match: { role: 'CUSTOMER' } },
      { $group: { _id: "$customerProfile.skinType", count: { $sum: 1 } } }
    ]);

    // B. Hair Type Breakdown
    const hairTypeStats = await User.aggregate([
      { $match: { role: 'CUSTOMER' } },
      { $group: { _id: "$customerProfile.hairType", count: { $sum: 1 } } }
    ]);

    // C. Most Common Skin Concerns (Unwound because it is an array)
    const skinConcernStats = await User.aggregate([
      { $match: { role: 'CUSTOMER' } },
      { $unwind: "$customerProfile.skinConcerns" },
      { $group: { _id: "$customerProfile.skinConcerns", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // D. Most Common Allergies (Unwound because it is an array)
    const allergyStats = await User.aggregate([
      { $match: { role: 'CUSTOMER' } },
      { $unwind: "$customerProfile.allergies" },
      { $group: { _id: "$customerProfile.allergies", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      skinTypeDistribution: skinTypeStats,
      hairTypeDistribution: hairTypeStats,
      topSkinConcerns: skinConcernStats,
      topCustomerAllergies: allergyStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating customer insights', error });
  }
};

// 6. CONSULT ALL REGISTERED CUSTOMERS (Admin Directory)
export const getCustomerDirectory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customers = await User.find({ role: 'CUSTOMER' })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving customer list', error });
  }
};