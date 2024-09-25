# Mongoose Models Documentation

This document provides an overview of the Mongoose models used in our application. Each model represents a collection in our MongoDB database and defines the structure and behavior of the documents within that collection.

## Table of Contents

1. [PromotionCode](#promotioncode)
2. [RevokedToken](#revokedtoken)
3. [SiteSettings](#sitesettings)
4. [User](#user)
5. [Variant](#variant)
6. [Message](#message)
7. [Newsletter](#newsletter)
8. [Order](#order)
9. [Product](#product)
10. [ProductTemplate](#producttemplate)
11. [Category](#category)
12. [Dispute](#dispute)
13. [EmailTemplate](#emailtemplate)

## PromotionCode

The `PromotionCode` model represents promotional codes used for discounts in the application.

#### Schema

```typescript
{
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  usageLimit: { type: Number, default: 0 }, // 0 means unlimited
  usageCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}
```

#### Fields Explanation

- `code`: A unique string representing the promotion code.
- `discountType`: The type of discount, either 'percentage' or 'fixed' amount.
- `discountValue`: The value of the discount (percentage or fixed amount).
- `validFrom`: The date from which the code becomes valid.
- `validUntil`: The expiration date of the code.
- `usageLimit`: The maximum number of times the code can be used (0 for unlimited).
- `usageCount`: The number of times the code has been used.
- `isActive`: A boolean indicating whether the code is currently active.

## RevokedToken

The `RevokedToken` model is used to keep track of revoked authentication tokens, typically used for logout functionality or security purposes.

#### Schema

```typescript
{
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true }
}
```

#### Fields Explanation

- `token`: The unique identifier of the revoked token.
- `expiresAt`: The date and time when the token expires and can be removed from the database.

## SiteSettings

The `SiteSettings` model stores global SEO and site configuration settings.

#### Schema

```typescript
{
  siteName: { type: String, required: true },
  siteDescription: { type: String, required: true },
  siteKeywords: [{ type: String }],
  socialMediaLinks: {
    facebook: String,
    twitter: String,
    instagram: String,
  },
  logoUrl: String,
}
```

#### Fields Explanation

- `siteName`: The name of the website.
- `siteDescription`: A brief description of the website for SEO purposes.
- `siteKeywords`: An array of keywords relevant to the website.
- `socialMediaLinks`: An object containing social media profile URLs.
- `logoUrl`: The URL of the website's logo image.

## User

The `User` model represents user accounts in the application, with advanced features like email encryption and password hashing.

#### Schema

```typescript
{
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and hyphens']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    validate: {
      validator: (value: string) => isEmail(value),
      message: 'Invalid email format'
    }
  },
  emailHash: { type: String, index: true, unique: true },
  password: { 
    type: String, 
    required: true,
    minlength: [8, 'Password must be at least 8 characters long']
   },
  profilePicture: { 
    type: String,
    validate: {
      validator: (value: string) => /^\/uploads\/profile-picture\/[\w-]+\.(jpg|jpeg|png|gif)$/.test(value),
      message: 'Invalid profile picture URL format'
    }
  },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: Date,
  resetPasswordToken: { type: String },
  resetPasswordExpires: Date,
  role: { type: String, enum: ['client', 'owner', 'admin'], default: 'client' },
  wishlist: [{ type: Types.ObjectId, ref: 'Product' }],
  notificationPreferences: {
    email: { type: Boolean, default: true },
    newsletters: { type: Boolean, default: false },
    orderUpdates: { type: Boolean, default: true },
  },
  isMagicLinkUser: { type: Boolean, default: false },
  lastTimeActive: Date,
}
```

#### Fields Explanation

- `username`: The user's unique username with validation rules.
- `email`: The user's email address (stored encrypted).
- `emailHash`: A hash of the email for faster lookups.
- `password`: The user's hashed password.
- `profilePicture`: URL of the user's profile picture.
- `isVerified`: Indicates if the user's email is verified.
- `verificationToken` and `verificationTokenExpires`: Used for email verification process.
- `resetPasswordToken` and `resetPasswordExpires`: Used for password reset process.
- `role`: The user's role in the system (client, owner, or admin).
- `wishlist`: An array of product IDs in the user's wishlist.
- `notificationPreferences`: User's preferences for different types of notifications.
- `isMagicLinkUser`: Indicates if the user uses magic link authentication.
- `lastTimeActive`: Timestamp of the user's last activity.

#### Methods

- `getDecryptedEmail()`: Returns the decrypted email of the user.
- `comparePassword(candidatePassword)`: Compares a given password with the user's hashed password.

#### Static Methods

- `findByEmail(email)`: Finds a user by their email address.

#### Middleware

- Pre-save hook: Hashes the password and encrypts the email before saving.

## Variant

The `Variant` model represents product variants, such as size or color options.

#### Schema

```typescript
{
  name: { type: String, required: true },
  changesPhoto: { type: Boolean, default: false },
  changesPrice: { type: Boolean, default: false },
  options: [{ type: String }],
}
```

#### Fields Explanation

- `name`: The name of the variant (e.g., "Size", "Color").
- `changesPhoto`: Indicates if this variant requires different product photos.
- `changesPrice`: Indicates if this variant affects the product price.
- `options`: An array of possible options for this variant (e.g., ["Small", "Medium", "Large"]).


## Message

The `Message` model represents communication messages within the application, which can be related to disputes, contact inquiries, or other categories.

#### Schema

```typescript
{
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerEmail: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  content: { type: String, required: true },
  readStatus: { type: Boolean, default: false },
  category: { type: String, enum: ['dispute', 'contact', 'other'], required: true },
  relatedOrder: { type: Schema.Types.ObjectId, ref: 'Order' },
  relatedDispute: { type: Schema.Types.ObjectId, ref: 'Dispute' },
  isAnonymous: { type: Boolean, required: true },
}
```

#### Fields Explanation

- `sender`: Reference to the User who sent the message (required for non-anonymous messages).
- `customerEmail`: Email of the customer (required for anonymous messages).
- `content`: The content of the message.
- `readStatus`: Indicates whether the message has been read.
- `category`: The category of the message (dispute, contact, or other).
- `relatedOrder`: Reference to an Order if the message is related to one.
- `relatedDispute`: Reference to a Dispute if the message is related to one.
- `isAnonymous`: Indicates if the message was sent anonymously.

#### Middleware

- Pre-validate hook: Ensures data integrity by checking that anonymous messages have a customer email and non-anonymous messages have a sender.

#### Indexing

An index is created on `{ isAnonymous: 1, sender: 1, customerEmail: 1 }` for efficient querying.

## Newsletter

The `Newsletter` model represents newsletter campaigns that can be sent to users.

#### Schema

```typescript
{
  title: { type: String, required: true },
  content: { type: String, required: true },
  featuredProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  scheduledDate: { type: Date, required: true },
  sentDate: Date,
  recipients: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['draft', 'scheduled', 'sent', 'cancelled'], default: 'draft' },
}
```

#### Fields Explanation

- `title`: The title of the newsletter.
- `content`: The main content of the newsletter.
- `featuredProducts`: An array of references to featured products in the newsletter.
- `scheduledDate`: The date when the newsletter is scheduled to be sent.
- `sentDate`: The date when the newsletter was actually sent.
- `recipients`: An array of references to Users who will receive the newsletter.
- `status`: The current status of the newsletter (draft, scheduled, sent, or cancelled).

## Order

The `Order` model represents customer orders in the e-commerce system.

#### Schema

```typescript
{
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    selectedVariants: { type: Map, of: String },
    price: { type: Number, required: true },
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'disputed'], 
    default: 'pending' 
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  shippingMethod: { type: String, required: true },
  shippingProvider: { type: String },
  shippingLabel: { type: String },
  trackingNumber: String,
  paymentMethod: { type: String, required: true },
  paymentGateway: { type: String },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  promoCodeUsed: String,
  disputeDetails: {
    reason: String,
    description: String,
    status: { type: String, enum: ['open', 'under review', 'resolved'] },
    resolution: String,
  },
  magicLink: String,
  magicLinkExpires: Date,
  customerEmail: String,
}
```

#### Fields Explanation

- `user`: Reference to the User who placed the order.
- `products`: An array of ordered products, including quantity, selected variants, and price.
- `totalAmount`: The total amount of the order.
- `status`: The current status of the order.
- `shippingAddress`: Details of the shipping address.
- `shippingMethod`, `shippingProvider`, `shippingLabel`, `trackingNumber`: Shipping-related information.
- `paymentMethod`, `paymentGateway`, `paymentStatus`: Payment-related information.
- `promoCodeUsed`: The promotion code used for the order, if any.
- `disputeDetails`: Information about any dispute related to the order.
- `magicLink`, `magicLinkExpires`, `customerEmail`: Fields for handling orders from non-logged-in users.

## Product

The `Product` model represents products available in the e-commerce system.

#### Schema

```typescript
{
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
}
```

#### Fields Explanation

- `name`, `description`: Basic product information.
- `category`: Reference to the product's category.
- `tags`: Array of tags associated with the product.
- `basePrice`: The base price of the product.
- `variants`: Array of product variants and their options.
- `defaultPhoto`: The main product image.
- `images`: Array of additional product images, including variant-specific images.
- `inventory`: Stock information for different variant combinations.
- `shippingDetails`: Shipping-related information, including weights for different variants.
- `seo`: SEO-related information, including a unique slug.
- `isActive`: Indicates if the product is currently active.

#### Middleware

- Pre-save hook: Generates the SEO slug based on the product name.

#### Methods

- `getStructuredData()`: Generates schema.org structured data for the product.

## ProductTemplate

The `ProductTemplate` model represents templates for creating new products with predefined attributes.

#### Schema

```typescript
{
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
}
```

#### Fields Explanation

- `name`: The name of the product template.
- `category`: Reference to the default category for products created from this template.
- `tags`: Array of default tags for products created from this template.
- `variants`: Array of references to default variants for products created from this template.
- `shippingDetails`: Default shipping details for products created from this template.

This template can be used to quickly create new products with predefined attributes, streamlining the product creation process.


## Category

The `Category` model represents product categories in the e-commerce system, allowing for hierarchical organization of products.

#### Schema

```typescript
{
  name: { type: String, required: true, unique: true },
  description: String,
  parent: { type: Schema.Types.ObjectId, ref: 'Category' },
  seo: {
    metaTitle: { type: String, required: true },
    metaDescription: { type: String, required: true },
    keywords: [{ type: String }],
    slug: { type: String, required: true, unique: true },
  },
}
```

#### Fields Explanation

- `name`: The unique name of the category.
- `description`: An optional description of the category.
- `parent`: A reference to a parent category, allowing for hierarchical categorization.
- `seo`: SEO-related information for the category, including:
  - `metaTitle`: The SEO title for the category page.
  - `metaDescription`: The SEO description for the category page.
  - `keywords`: An array of SEO keywords.
  - `slug`: A unique, URL-friendly version of the category name.

#### Middleware

- Pre-save hook: Automatically generates the SEO slug based on the category name.

## Dispute

The `Dispute` model represents customer disputes related to orders in the e-commerce system.

#### Schema

```typescript
{
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'under review', 'resolved'], default: 'open' },
  resolution: String,
}
```

#### Fields Explanation

- `order`: A reference to the Order that is being disputed.
- `user`: A reference to the User who opened the dispute.
- `reason`: The main reason for the dispute.
- `description`: A detailed description of the dispute.
- `status`: The current status of the dispute (open, under review, or resolved).
- `resolution`: An optional field to describe how the dispute was resolved.

The schema includes timestamps to track when the dispute was created and last updated.

## EmailTemplate

The `EmailTemplate` model represents reusable email templates for various system communications.

#### Schema

```typescript
{
  name: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  variables: [{ type: String }],
}
```

#### Fields Explanation

- `name`: A unique name for the email template.
- `subject`: The subject line of the email.
- `body`: The main content of the email template.
- `variables`: An array of variable names that can be used within the template for personalization.

This model allows for the creation and management of standardized email templates, which can be easily customized with specific variables for different use cases.
