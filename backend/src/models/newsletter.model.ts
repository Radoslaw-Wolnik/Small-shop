// src/models/newsletter.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface INewsletterDocument extends Document {
  title: string;
  content: string;
  featuredProducts: Schema.Types.ObjectId[];
  scheduledDate: Date;
  sentDate?: Date;
  recipients: Schema.Types.ObjectId[];
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
}

const newsletterSchema = new Schema<INewsletterDocument>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  featuredProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  scheduledDate: { type: Date, required: true },
  sentDate: Date,
  recipients: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['draft', 'scheduled', 'sent', 'cancelled'], default: 'draft' },
}, { timestamps: true });

const Newsletter = mongoose.model<INewsletterDocument>('Newsletter', newsletterSchema);
export default Newsletter;