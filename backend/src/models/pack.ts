import mongoose, { Schema, Document } from 'mongoose';
import { PRODUCT_TAGS, ProductTag } from '../config/constants';

export interface IPack extends Document {
  name: string;
  description: string;
  products: mongoose.Types.ObjectId[]; // Array of Product references
  price: number; // Custom discounted price for the entire pack
  imageUrl: string;
  tags: ProductTag[];
  createdAt: Date;
  updatedAt: Date;
}

const PackSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  products: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  }],
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  tags: {
    type: [String],
    validate: {
      validator: (v: string[]) => v.every(val => PRODUCT_TAGS.includes(val as ProductTag)),
      message: 'Invalid pack tag value detected.'
    }
  }
}, { timestamps: true });

export default mongoose.model<IPack>('Pack', PackSchema);