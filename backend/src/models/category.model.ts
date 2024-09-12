// src/models/category.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ICategoryDocument extends Document {
  name: string;
  description: string;
  parent?: Schema.Types.ObjectId;
}

const categorySchema = new Schema<ICategoryDocument>({
  name: { type: String, required: true, unique: true },
  description: String,
  parent: { type: Schema.Types.ObjectId, ref: 'Category' },
});

export const Category = mongoose.model<ICategoryDocument>('Category', categorySchema);
