import mongoose, { Schema, Document } from 'mongoose';
import { 
  SKIN_TYPES, SKIN_CONCERNS, HAIR_TYPES, ALLERGIES, 
  SkinType, SkinConcern, HairType, Allergy 
} from '../config/constants';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'CUSTOMER' | 'ADMIN';
  phone?: string;
  customerProfile: {
    ageRange: string;
    sex: string;
    skinType: SkinType;
    skinConcerns: SkinConcern[];
    hairType: HairType;
    allergies: Allergy[];
  };
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['CUSTOMER', 'ADMIN'], default: 'CUSTOMER' },
  phone: { type: String },
  customerProfile: {
    ageRange: { type: String },      // Added field
    sex: { type: String }, 
    skinType: { type: String, enum: SKIN_TYPES, default: 'Normal' },
    skinConcerns: {
      type: [String],
      validate: {
        validator: (v: string[]) => v.every(val => SKIN_CONCERNS.includes(val as SkinConcern)),
        message: 'Invalid skin concern value detected.'
      }
    },
    hairType: { type: String, enum: HAIR_TYPES, default: 'Normal' },
    allergies: {
      type: [String],
      validate: {
        validator: (v: string[]) => v.every(val => ALLERGIES.includes(val as Allergy)),
        message: 'Invalid allergy value detected.'
      }
    }
  }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);