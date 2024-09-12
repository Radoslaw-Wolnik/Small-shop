// src/models/productTemplate.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IProductTemplateDocument extends Document {
  name: string;
  category: Schema.Types.ObjectId;
  variations: {
    type: string;
    options: string[];
    affectsPrice: boolean;
  }[];
}

const productTemplateSchema = new Schema<IProductTemplateDocument>({
  name: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  variations: [{
    type: { type: String, required: true },
    options: [String],
    affectsPrice: { type: Boolean, default: false },
  }],
});

export const ProductTemplate = mongoose.model<IProductTemplateDocument>('ProductTemplate', productTemplateSchema);
