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
  isAnonymous: boolean;
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
  isAnonymous: { type: Boolean, required: true },
}, { timestamps: true });


// Custom validator to ensure data integrity
messageSchema.pre('validate', function(next) {
  if (this.isAnonymous && !this.customerEmail) {
    next(new Error('Customer email is required for anonymous messages'));
  } else if (!this.isAnonymous && !this.sender) {
    next(new Error('Sender is required for non-anonymous messages'));
  } else {
    next();
  }
});

// Index for efficient querying
messageSchema.index({ isAnonymous: 1, sender: 1, customerEmail: 1 });

const Message = mongoose.model<IMessageDocument>('Message', messageSchema);
export default Message;