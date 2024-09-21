// src/models/message.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IMessageDocument extends Document {
  sender?: Schema.Types.ObjectId;
  customerEmail?: string;
  content: string;
  readStatus: boolean;
  category: 'dispute' | 'contact' | 'other';
  relatedOrder?: Schema.Types.ObjectId;
  relatedDispute?: Schema.Types.ObjectId;
  createdAt: Date;
}

const messageSchema = new Schema<IMessageDocument>({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerEmail: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  content: { type: String, required: true },
  readStatus: { type: Boolean, default: false },
  category: { type: String, enum: ['dispute', 'contact', 'other'], required: true },
  relatedOrder: { type: Schema.Types.ObjectId, ref: 'Order' },
  relatedDispute: { type: Schema.Types.ObjectId, ref: 'Dispute' },
}, { timestamps: true });

// Custom validator to ensure either sender or customerEmail is provided
messageSchema.pre('validate', function(next) {
  if (!this.sender && !this.customerEmail) {
    next(new Error('Either sender or customerEmail must be provided'));
  } else {
    next();
  }
});

export const Message = mongoose.model<IMessageDocument>('Message', messageSchema);