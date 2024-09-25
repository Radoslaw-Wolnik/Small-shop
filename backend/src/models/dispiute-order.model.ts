import mongoose, { Document, Schema } from 'mongoose';

// Dispute Model
export interface IDisputeDocument extends Document {
  order: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  reason: string;
  description: string;
  status: 'open' | 'under review' | 'resolved';
  resolution?: string;
  attachments: {url: string, fileType: string}[];
  messages: Schema.Types.ObjectId[]
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
  attachments: [{ 
    url: String, 
    fileType: String 
  }],
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }]
}, { timestamps: true });

export default mongoose.model<IDisputeDocument>('Dispute', disputeSchema);