// src/models/message.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IMessageDocument extends Document {
  user: Schema.Types.ObjectId;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

const messageSchema = new Schema<IMessageDocument>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Message = mongoose.model<IMessageDocument>('Message', messageSchema);