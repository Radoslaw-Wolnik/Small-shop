import mongoose, { Document, Schema } from 'mongoose';

// PromoCode Model
export interface IPromotionCodeDocument extends Document {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    validFrom: Date;
    validUntil: Date;
    usageLimit: number;
    usageCount: number;
    isActive: boolean;
  }
  
  const promotionCodeSchema = new Schema<IPromotionCodeDocument>({
    code: { type: String, required: true, unique: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    usageLimit: { type: Number, default: 0 }, // 0 means unlimited
    usageCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  });
  
  export const PromoCode = mongoose.model<IPromotionCodeDocument>('PromotionCode', promotionCodeSchema);
  