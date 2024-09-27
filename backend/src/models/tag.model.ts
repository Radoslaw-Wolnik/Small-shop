// src/models/tag.model.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITagDocument extends Document {
  name: string;
  description?: string;
}

interface ITagModel extends Model<ITagDocument> {
  // You can add static methods here if needed
}

const tagSchema = new Schema<ITagDocument>({
  name: { type: String, required: true, unique: true },
  description: { type: String },
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Index the name field for faster lookups
tagSchema.index({ name: 1 });

const Tag = mongoose.model<ITagDocument, ITagModel>('Tag', tagSchema);

export default Tag;