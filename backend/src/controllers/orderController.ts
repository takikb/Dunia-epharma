import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Order from '../models/order';
import Product from '../models/product';

// 1. Create a New Order (Checkout)
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    // Extract deliveryCompany and deliveryType from request body
    const { items, shippingAddress, phoneNumber, deliveryCompany, deliveryType } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ message: 'No items in order' });
      return;
    }

    let calculatedTotal = 0;
    const orderItemsToSave = [];

    // Validate stock and calculate total prices
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        res.status(404).json({ message: `Product not found: ${item.product}` });
        return;
      }

      if (product.stockQuantity < item.quantity) {
        res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Only ${product.stockQuantity} remaining.` 
        });
        return;
      }

      const discountAmount = (product.price * product.discountPercentage) / 100;
      const finalPrice = product.price - discountAmount;

      calculatedTotal += finalPrice * item.quantity;

      orderItemsToSave.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: finalPrice
      });
    }

    // Deduct stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: -item.quantity }
      });
    }

    // Save the Order with shipping specifications
    const newOrder = new Order({
      user: req.user.userId,
      items: orderItemsToSave,
      totalAmount: calculatedTotal,
      shippingAddress,
      phoneNumber,
      deliveryCompany, // Saved to DB
      deliveryType,    // Saved to DB
      status: 'PENDING'
    });

    await newOrder.save();

    res.status(201).json({
      message: 'Order placed successfully!',
      order: newOrder
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing order', error });
  }
};


// 2. Get Logged-In User's Orders (Customer Dashboard)
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const orders = await Order.find({ user: req.user.userId })
      .populate('items.product', 'name imageUrl')
      .sort({ createdAt: -1 }); // Newest orders first

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving your orders', error });
  }
};

// 3. Get All Orders (Admin Only)
export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving all orders', error });
  }
};

// 4. Update Order Status (Admin Only - e.g., PENDING -> SHIPPED -> DELIVERED)
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    
    if (!['PENDING', 'SHIPPED', 'DELIVERED'].includes(status)) {
      res.status(400).json({ message: 'Invalid status update payload' });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.status(200).json({ message: `Order marked as ${status} successfully`, order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error });
  }
};

// 5. Get Invoice Payload (Customer/Admin - Only available if DELIVERED)
export const getOrderInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name');

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (order.user._id.toString() !== req.user.userId && req.user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Access denied. This invoice does not belong to you.' });
      return;
    }

    if (order.status !== 'DELIVERED') {
      res.status(400).json({ 
        message: 'Invoices are only generated for completed and delivered orders.' 
      });
      return;
    }

    res.status(200).json({
      invoiceNumber: `INV-${order._id.toString().slice(-6).toUpperCase()}`,
      issueDate: order.updatedAt,
      customerName: (order.user as any).name,
      customerEmail: (order.user as any).email,
      shippingAddress: order.shippingAddress,
      phoneNumber: order.phoneNumber,
      deliveryCompany: order.deliveryCompany, // Added to invoice payload
      deliveryType: order.deliveryType,       // Added to invoice payload
      items: order.items.map(item => ({
        name: (item.product as any).name,
        quantity: item.quantity,
        unitPrice: item.priceAtPurchase,
        totalPrice: item.priceAtPurchase * item.quantity
      })),
      totalAmount: order.totalAmount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error compiling invoice', error });
  }
};