// src/models/product-template.model.ts
import mongoose, { Document, Schema } from 'mongoose';

interface IProductTemplateDocument extends Document {
  name: string;
  category: Schema.Types.ObjectId;
  tags: string[];
  variants: Schema.Types.ObjectId[];
  shippingDetails: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
  };
}

const productTemplateSchema = new Schema<IProductTemplateDocument>({
  name: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  tags: [{ type: String }],
  variants: [{ type: Schema.Types.ObjectId, ref: 'Variant' }],
  shippingDetails: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
  },
});

export default mongoose.model<IProductTemplateDocument>('ProductTemplate', productTemplateSchema);