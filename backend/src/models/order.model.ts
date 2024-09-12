// src/models/order.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderDocument extends Document {
  user: Schema.Types.ObjectId;
  items: {
    product: Schema.Types.ObjectId;
    quantity: number;
    variations: Record<string, string>;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrderDocument>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    variations: { type: Map, of: String },
    price: { type: Number, required: true },
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  trackingNumber: String,
}, { timestamps: true });

export const Order = mongoose.model<IOrderDocument>('Order', orderSchema);