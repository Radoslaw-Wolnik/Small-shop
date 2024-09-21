// src/models/product.model.ts
import mongoose, { Document, Schema } from 'mongoose';

// Updated Product Model
export interface IProductDocument extends Document {
  name: string;
  description: string;
  category: Schema.Types.ObjectId;
  tags: string[];
  basePrice: number;
  variants: {
    variant: Schema.Types.ObjectId;
    options: {
      name: string;
      price?: number;
      photo?: string;
    }[];
  }[];
  defaultPhoto: string;
  variantPhotos: {
    variant: Schema.Types.ObjectId;
    option: string;
    photo: string;
  }[];
  inventory: {
    variantCombination: string;
    stock: number;
  }[];
  shippingDetails: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    variantWeights?: {
      variant: Schema.Types.ObjectId;
      option: string;
      weight: number;
    }[];
  };
}

const productSchema = new Schema<IProductDocument>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  tags: [{ type: String }],
  basePrice: { type: Number, required: true },
  variants: [{
    variant: { type: Schema.Types.ObjectId, ref: 'Variant', required: true },
    options: [{
      name: { type: String, required: true },
      price: Number,
      photo: String,
    }],
  }],
  defaultPhoto: { type: String, required: true },
  variantPhotos: [{
    variant: { type: Schema.Types.ObjectId, ref: 'Variant', required: true },
    option: { type: String, required: true },
    photo: { type: String, required: true },
  }],
  inventory: [{
    variantCombination: { type: String, required: true },
    stock: { type: Number, required: true },
  }],
  shippingDetails: {
    weight: { type: Number, required: true },
    dimensions: {
      length: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
    variantWeights: [{
      variant: { type: Schema.Types.ObjectId, ref: 'Variant' },
      option: String,
      weight: Number,
    }],
  },
});

export const Product = mongoose.model<IProductDocument>('Product', productSchema);