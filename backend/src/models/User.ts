// models/User.ts
import mongoose, { Document, Types } from 'mongoose';

export interface IUserDocument extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  role: 'user' | 'admin';
}

const userSchema = new mongoose.Schema<IUserDocument>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String },

  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: Date,

  resetPasswordToken: { type: String },
  resetPasswordExpires: Date,

  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

export default mongoose.model<IUserDocument>('User', userSchema);