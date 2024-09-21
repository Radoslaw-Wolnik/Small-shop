// src/models/category.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ICategoryDocument extends Document {
  name: string;
  description: string;
  parent?: Schema.Types.ObjectId;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    slug: string;
  };
}

const categorySchema = new Schema<ICategoryDocument>({
  name: { type: String, required: true, unique: true },
  description: String,
  parent: { type: Schema.Types.ObjectId, ref: 'Category' },
  seo: {
    metaTitle: { type: String, required: true },
    metaDescription: { type: String, required: true },
    keywords: [{ type: String }],
    slug: { type: String, required: true, unique: true },
  },
});


// pre-save hook to generate the slug
categorySchema.pre('save', function(next) {
  if (!this.seo.slug) {
    this.seo.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

export default mongoose.model<ICategoryDocument>('Category', categorySchema);
