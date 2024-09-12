// src/models/newsletter.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface INewsletterDocument extends Document {
  subject: string;
  content: string;
  scheduledDate: Date;
  sent: boolean;
}

const newsletterSchema = new Schema<INewsletterDocument>({
  subject: { type: String, required: true },
  content: { type: String, required: true },
  scheduledDate: { type: Date, required: true },
  sent: { type: Boolean, default: false },
});

export const Newsletter = mongoose.model<INewsletterDocument>('Newsletter', newsletterSchema);
