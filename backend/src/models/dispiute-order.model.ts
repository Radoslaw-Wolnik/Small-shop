import mongoose, { Document, Schema } from 'mongoose';

// Dispute Model
export interface IDisputeDocument extends Document {
  order: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  reason: string;
  description: string;
  status: 'open' | 'under review' | 'resolved';
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

const disputeSchema = new Schema<IDisputeDocument>({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'under review', 'resolved'], default: 'open' },
  resolution: String,
}, { timestamps: true });

const Dispute = mongoose.model<IDisputeDocument>('Dispute', disputeSchema);
export default Dispute;