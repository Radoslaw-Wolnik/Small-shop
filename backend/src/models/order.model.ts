// src/models/order.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderDocument extends Document {
  user: Schema.Types.ObjectId;
  products: {
    product: Schema.Types.ObjectId;
    quantity: number;
    selectedVariants: { [key: string]: string };
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  shippingMethod: string;
  trackingNumber?: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  promoCodeUsed?: string;
  disputeDetails?: {
    reason: string;
    description: string;
    status: 'open' | 'under review' | 'resolved';
    resolution?: string;
  };
  createdAt: Date;
  updatedAt: Date;

  magicLink?: string;
  magicLinkExpires?: Date;
  customerEmail?: string; // For non-logged in users
}

const orderSchema = new Schema<IOrderDocument>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    selectedVariants: { type: Map, of: String },
    price: { type: Number, required: true },
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'disputed'], 
    default: 'pending' 
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  shippingMethod: { type: String, required: true },
  trackingNumber: String,
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  promoCodeUsed: String,
  disputeDetails: {
    reason: String,
    description: String,
    status: { type: String, enum: ['open', 'under review', 'resolved'] },
    resolution: String,
  },

  // for not logged in users
  magicLink: String,
  magicLinkExpires: Date,
  customerEmail: String,
}, { timestamps: true });

export const Order = mongoose.model<IOrderDocument>('Order', orderSchema);
