// src/models/product.model.ts
import mongoose, { Document, Schema, Model } from 'mongoose';
import slugify from 'slugify';

// Updated Product Model
export interface IProductDocument extends Document {
  name: string;
  description: string;
  category: Schema.Types.ObjectId;
  tags: Schema.Types.ObjectId[];
  basePrice: number;
  variants: {
    variant: Schema.Types.ObjectId;
    options: {
      name: string;
      price?: number;
    }[];
  }[];
  defaultPhoto: string;
  images: {
    url: string;
    altText: string;
    variantOption?: {
      variant: Schema.Types.ObjectId;
      option: string;
    };
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
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    slug: string;
  };
  isActive: boolean;
  getStructuredData: () => Record<string, any>;
  reserveInventory: (variantCombination: string, quantity: number) => Promise<void>;
  releaseInventory: (variantCombination: string, quantity: number) => Promise<void>;
}

interface IProductModel extends Model<IProductDocument> {
  findBySlug: (slug: string) => Promise<IProductDocument | null>;
}

const productSchema = new Schema<IProductDocument>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  basePrice: { type: Number, required: true },
  variants: [{
    variant: { type: Schema.Types.ObjectId, ref: 'Variant', required: true },
    options: [{
      name: { type: String, required: true },
      price: Number,
    }],
  }],
  defaultPhoto: { type: String, required: true },
  images: [{
    url: { type: String, required: true },
    altText: { type: String, required: true },
    variantOption: {
      variant: { type: Schema.Types.ObjectId, ref: 'Variant' },
      option: String,
    },
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
  seo: {
    metaTitle: { type: String, required: true },
    metaDescription: { type: String, required: true },
    keywords: [{ type: String }],
    slug: { type: String, required: true, unique: true },
  },
  isActive: { type: Boolean, default: true },
});

// pre-save hook to generate the slug
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.seo.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Method to get structured data
productSchema.methods.getStructuredData = function() {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": this.name,
    "description": this.description,
    "sku": this._id,
    "image": this.defaultPhoto,
    "brand": {
      "@type": "Brand",
      "name": "Your Brand Name"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://yoursite.com/product/${this.seo.slug}`,
      "priceCurrency": "USD",
      "price": this.basePrice,
      "availability": this.inventory.some((inv: { stock: number }) => inv.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };
};

// Method to reserve inventory
productSchema.methods.reserveInventory = async function(this: IProductDocument, variantCombination: string, quantity: number) {
  const inventoryItem = this.inventory.find((inv: { variantCombination: string; stock: number }) => inv.variantCombination === variantCombination);
  if (!inventoryItem || inventoryItem.stock < quantity) {
    throw new Error('Insufficient inventory');
  }
  inventoryItem.stock -= quantity;
  await this.save();
};

// Method to release inventory
productSchema.methods.releaseInventory = async function(this: IProductDocument, variantCombination: string, quantity: number) {
  const inventoryItem = this.inventory.find((inv: { variantCombination: string; stock: number }) => inv.variantCombination === variantCombination);
  if (inventoryItem) {
    inventoryItem.stock += quantity;
    await this.save();
  }
};

// Static method to find product by slug
productSchema.statics.findBySlug = function(slug: string) {
  return this.findOne({ 'seo.slug': slug });
};

const Product = mongoose.model<IProductDocument, IProductModel>('Product', productSchema);

export default Product;