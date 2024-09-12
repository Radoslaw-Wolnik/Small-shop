// models/User.ts
import mongoose, { Document, Types, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { encrypt, decrypt, hashEmail } from '../utils/encryption.util';
import isEmail from 'validator/lib/isEmail';

export interface IUserDocument extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  emailHash: string;
  password: string;
  profilePicture?: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  getDecryptedEmail(): Promise<string>;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Extend the IUserDocument interface to include static methods
export interface IUserModel extends Model<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
}

const userSchema = new mongoose.Schema<IUserDocument, IUserModel>({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and hyphens']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    validate: {
      validator: (value: string) => isEmail(value),
      message: 'Invalid email format'
    }
  },
  emailHash: { type: String, index: true, unique: true }, // For faster lookups
  password: { 
    type: String, 
    required: true,
    minlength: [8, 'Password must be at least 8 characters long']
   },
  profilePicture: { 
    type: String,
    validate: {
      validator: (value: string) => /^\/uploads\/profile-picture\/[\w-]+\.(jpg|jpeg|png|gif)$/.test(value),
      message: 'Invalid profile picture URL format'
    }
  },

  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: Date,

  resetPasswordToken: { type: String },
  resetPasswordExpires: Date,

  role: { type: String, enum: ['user', 'admin'], default: 'user' }
  },
  { timestamps: true }
);


userSchema.methods.getDecryptedEmail = async function(this: IUserDocument): Promise<string> {
  try {
    return decrypt(this.email);
  } catch (error) {
    throw new Error('Failed to get decrypted email');
  }
};


userSchema.statics.findByEmail = async function(this: IUserModel, email: string): Promise<IUserDocument | null> {
  const emailHash = await hashEmail(email);
  return this.findOne({ emailHash });
};

// Hash password and encrypt email before saving
userSchema.pre('save', async function(this: IUserDocument, next) {
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error instanceof Error ? error : new Error('Failed to hash password'));
    }
  }

  if (this.isModified('email')) {
    try {
      const encryptedEmail = await encrypt(this.email);
      this.email = encryptedEmail;
      this.emailHash = await hashEmail(encryptedEmail);
    } catch (error) {
      return next(new Error('Failed to encrypt email'));
    }
  }

  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(this: IUserDocument, candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Failed to compare password');
  }
};

const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);

export default User;