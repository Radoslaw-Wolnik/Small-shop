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
  
  shippingAddress: Schema.Types.ObjectId;
  shippingMethod: string;
  shippingProvider?: string;
  shippingLabel?: string;
  trackingNumber?: string;

  paymentMethod: string;
  paymentGateway?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  transactionId?: string;
  paymentUrl?: string;

  promoCodeUsed?: string;
  disputeId?: Schema.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;

  anonToken?: string;
  anonTokenExpires?: Date;
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

  shippingAddress: { type: Schema.Types.ObjectId, ref: 'Address', required: true },
  shippingMethod: { type: String, required: true },
  shippingProvider: { type: String },
  shippingLabel: { type: String },
  trackingNumber: String,

  paymentMethod: { type: String, required: true },
  paymentGateway: { type: String },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  transactionId: { type: String },
  paymentUrl: { type: String },

  promoCodeUsed: String,
  disputeId: { type: Schema.Types.ObjectId, ref: 'Dispute' },

  // for not logged in users
  anonToken: String,
  anonTokenExpires: Date,
  
}, { timestamps: true });

export default mongoose.model<IOrderDocument>('Order', orderSchema);
