// backend/src/models/Order.ts
import mongoose, { Schema, Document } from 'mongoose';
import { DELIVERY_COMPANIES, DELIVERY_TYPES, DeliveryCompany, DeliveryType } from '../config/constants';

interface IOrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  priceAtPurchase: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'DELIVERED' | 'CANCELLED';
  shippingAddress: string;
  phoneNumber: string;
  deliveryCompany: DeliveryCompany; // Added field
  deliveryType: DeliveryType;       // Added field
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  priceAtPurchase: { type: Number, required: true }
});

const OrderSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'DELIVERED', 'CANCELLED'], 
    default: 'PENDING' 
  },
  shippingAddress: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  deliveryCompany: { 
    type: String, 
    enum: DELIVERY_COMPANIES, 
    required: true // Forces customer to choose a delivery company
  },
  deliveryType: { 
    type: String, 
    enum: DELIVERY_TYPES, 
    required: true // Forces customer to choose between HOME_DELIVERY and STOP_DESK
  }
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);