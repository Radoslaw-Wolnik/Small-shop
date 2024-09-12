// src/models/product.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IProductDocument extends Document {
  name: string;
  description: string;
  category: Schema.Types.ObjectId;
  tags: string[];
  basePrice: number;
  variations: {
    type: string;
    options: string[];
    affectsPrice: boolean;
    prices?: Record<string, number>;
  }[];
  images: {
    url: string;
    altText: string;
    variationKey?: string;
    variationValue?: string;
  }[];
  inventory: Record<string, number>;
}

const productSchema = new Schema<IProductDocument>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  tags: [String],
  basePrice: { type: Number, required: true },
  variations: [{
    type: { type: String, required: true },
    options: [String],
    affectsPrice: { type: Boolean, default: false },
    prices: { type: Map, of: Number },
  }],
  images: [{
    url: { type: String, required: true },
    altText: String,
    variationKey: String,
    variationValue: String,
  }],
  inventory: { type: Map, of: Number },
});

export const Product = mongoose.model<IProductDocument>('Product', productSchema);
