import mongoose, { Document, Schema } from 'mongoose';

export interface IAddressDocument extends Document {
  user: Schema.Types.ObjectId;
  label: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
}

const addressSchema = new Schema<IAddressDocument>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  label: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  zipCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IAddressDocument>('Address', addressSchema);