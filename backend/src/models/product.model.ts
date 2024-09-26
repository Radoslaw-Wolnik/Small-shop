// src/models/product.model.ts
import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';

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


// Example of implementing schema.org structured data in Product model
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
      "availability": this.inventory.length > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };
};

productSchema.methods.reserveInventory = async function(quantity: number) {
  if (this.inventory < quantity) {
    throw new Error('Insufficient inventory');
  }
  this.inventory -= quantity;
  this.reservedInventory = (this.reservedInventory || 0) + quantity;
  await this.save();
};

productSchema.methods.releaseInventory = async function(quantity: number) {
  this.reservedInventory = Math.max((this.reservedInventory || 0) - quantity, 0);
  this.inventory += quantity;
  await this.save();
};


export default mongoose.model<IProductDocument>('Product', productSchema);