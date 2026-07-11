// backend/src/models/Product.ts
import mongoose, { Schema, Document } from 'mongoose';
import { CATEGORIES, PRODUCT_TAGS, Category, ProductTag } from '../config/constants';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  galleryImages: string[]; // Added array for up to 4 images
  category: Category; // Added Category type
  discountPercentage: number;
  lowStockThreshold: number;
  tags: ProductTag[];
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  stockQuantity: { type: Number, required: true, default: 0 },
  imageUrl: { type: String, required: true },
  galleryImages: [{ type: String }], // Array of image URLs
  category: { 
    type: String, 
    enum: CATEGORIES, 
    required: true // Every product MUST belong to a category
  },
  discountPercentage: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  tags: {
    type: [String],
    validate: {
      validator: (v: string[]) => v.every(val => PRODUCT_TAGS.includes(val as ProductTag)),
      message: 'Invalid product tag value detected.'
    }
  }
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', ProductSchema);