// src/models/message.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IMessageDocument extends Document {
  sender: Schema.Types.ObjectId;
  content: string;
  readStatus: boolean;
  category: 'dispute' | 'contact' | 'other';
  relatedOrder?: Schema.Types.ObjectId;
  relatedDispute?: Schema.Types.ObjectId;
  createdAt: Date;
}

const messageSchema = new Schema<IMessageDocument>({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  readStatus: { type: Boolean, default: false },
  category: { type: String, enum: ['dispute', 'contact', 'other'], required: true },
  relatedOrder: { type: Schema.Types.ObjectId, ref: 'Order' },
  relatedDispute: { type: Schema.Types.ObjectId, ref: 'Dispute' },
}, { timestamps: true });

export const Message = mongoose.model<IMessageDocument>('Message', messageSchema);