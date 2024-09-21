import mongoose, { Document, Schema } from 'mongoose';

// Variant Model
interface IVariantDocument extends Document {
  name: string;
  changesPhoto: boolean;
  changesPrice: boolean;
  options: string[];
}

const variantSchema = new Schema<IVariantDocument>({
  name: { type: String, required: true },
  changesPhoto: { type: Boolean, default: false },
  changesPrice: { type: Boolean, default: false },
  options: [{ type: String }],
});

export const Variant = mongoose.model<IVariantDocument>('Variant', variantSchema);