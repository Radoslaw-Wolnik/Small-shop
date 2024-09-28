# Mongoose Models Documentation

This document provides an overview of the Mongoose models used in our application. Each model represents a collection in our MongoDB database and defines the structure and behavior of the documents within that collection.

## Table of Contents

1. [Address](#address)
2. [Category](#category)
3. [Dispute](#dispute)
4. [EmailTemplate](#emailtemplate)
5. [Message](#message)
6. [Newsletter](#newsletter)
7. [Order](#order)
8. [Product](#product)
9. [PromotionCode](#promotioncode)
10. [RevokedToken](#revokedtoken)
11. [SiteSettings](#sitesettings)
12. [Tag](#tag)
13. [User](#user)
14. [Variant](#variant)

## Address

The `Address` model represents shipping addresses for users.

#### Schema

```typescript
{
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  label: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  zipCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}
```

#### Fields Explanation

- `user`: Reference to the User who owns this address.
- `label`: A label for the address (e.g., "Home", "Work").
- `street`: Street address.
- `city`: City name.
- `state`: State or province.
- `country`: Country name.
- `zipCode`: Postal or ZIP code.
- `isDefault`: Indicates if this is the user's default address.

## Category

The `Category` model represents product categories in the e-commerce system.

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
- `seo`: SEO-related information for the category.

#### Middleware

- Pre-save hook: Automatically generates the SEO slug based on the category name.

## Dispute

The `Dispute` model represents customer disputes related to orders.

#### Schema

```typescript
{
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'under review', 'resolved'], default: 'open' },
  resolution: String,
  attachments: [{ 
    url: String, 
    fileType: String 
  }],
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }]
}
```

#### Fields Explanation

- `order`: Reference to the disputed Order.
- `user`: Reference to the User who opened the dispute.
- `reason`: The main reason for the dispute.
- `description`: A detailed description of the dispute.
- `status`: The current status of the dispute.
- `resolution`: Description of how the dispute was resolved.
- `attachments`: Array of attached files related to the dispute.
- `messages`: Array of references to Messages related to the dispute.

## EmailTemplate

The `EmailTemplate` model represents reusable email templates.

#### Schema

```typescript
{
  name: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  htmlBody: { type: String, required: true },
  textBody: { type: String, required: true },
  variables: [{ type: String }]
}
```

#### Fields Explanation

- `name`: A unique name for the email template.
- `subject`: The subject line of the email.
- `htmlBody`: The HTML content of the email template.
- `textBody`: The plain text content of the email template.
- `variables`: An array of variable names used within the template.

## Message

The `Message` model represents communication messages within the application.

#### Schema

```typescript
{
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  readStatus: { type: Boolean, default: false },
  category: { type: String, enum: ['dispute', 'contact', 'other'], required: true },
  relatedOrder: { type: Schema.Types.ObjectId, ref: 'Order' },
  relatedDispute: { type: Schema.Types.ObjectId, ref: 'Dispute' },
  relatedProduct: { type: Schema.Types.ObjectId, ref: 'Product' },
  attachments: [{ 
    url: String, 
    fileType: String 
  }],
}
```

#### Fields Explanation

- `sender`: Reference to the User who sent the message.
- `content`: The content of the message.
- `readStatus`: Indicates whether the message has been read.
- `category`: The category of the message.
- `relatedOrder`: Reference to a related Order, if applicable.
- `relatedDispute`: Reference to a related Dispute, if applicable.
- `relatedProduct`: Reference to a related Product, if applicable.
- `attachments`: Array of attached files.

## Newsletter

The `Newsletter` model represents newsletter campaigns.

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
- `featuredProducts`: Array of references to featured products.
- `scheduledDate`: The date when the newsletter is scheduled to be sent.
- `sentDate`: The date when the newsletter was actually sent.
- `recipients`: Array of references to Users who will receive the newsletter.
- `status`: The current status of the newsletter.

## Order

The `Order` model represents customer orders in the e-commerce system.

#### Schema

```typescript
{
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: false },
    isAnonymous: { type: Boolean, default: true },
  },
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
  shippingAddress: { type: Schema.Types.ObjectId, ref: 'Address', required: true },
  shippingMethod: { type: String, required: true },
  shippingProvider: { type: String },
  shippingLabel: { type: String },
  trackingNumber: String,
  paymentMethod: { type: String, required: true },
  paymentGateway: { type: String },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  transactionId: { type: String },
  paymentUrl: { type: String },
  promoCodeUsed: String,
  disputeId: { type: Schema.Types.ObjectId, ref: 'Dispute' },
  anonToken: String,
  anonTokenExpires: Date,
}
```

#### Fields Explanation

- `user`: Reference to the User who placed the order.
- `products`: Array of ordered products, including quantity, selected variants, and price.
- `totalAmount`: The total amount of the order.
- `status`: The current status of the order.
- `shippingAddress`: Reference to the Address for shipping.
- `shippingMethod`, `shippingProvider`, `shippingLabel`, `trackingNumber`: Shipping-related information.
- `paymentMethod`, `paymentGateway`, `paymentStatus`: Payment-related information.
- `transactionId`: ID of the payment transaction.
- `paymentUrl`: URL for completing the payment, if applicable.
- `promoCodeUsed`: The promotion code used for the order, if any.
- `disputeId`: Reference to a Dispute related to this order, if any.
- `anonToken`, `anonTokenExpires`: Fields for handling orders from non-logged-in users.

## Product

The `Product` model represents products available in the e-commerce system.

#### Schema

```typescript
{
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
}
```

#### Fields Explanation

- `name`, `description`: Basic product information.
- `category`: Reference to the product's category.
- `tags`: Array of references to Tags associated with the product.
- `basePrice`: The base price of the product.
- `variants`: Array of product variants and their options.
- `defaultPhoto`: The main product image.
- `images`: Array of additional product images, including variant-specific images.
- `inventory`: Stock information for different variant combinations.
- `shippingDetails`: Shipping-related information, including weights for different variants.
- `seo`: SEO-related information, including a unique slug.
- `isActive`: Indicates if the product is currently active.

#### Methods

- `getStructuredData()`: Generates schema.org structured data for the product.
- `reserveInventory(variantCombination, quantity)`: Reserves inventory for a specific variant combination.
- `releaseInventory(variantCombination, quantity)`: Releases previously reserved inventory.

#### Static Methods

- `findBySlug(slug)`: Finds a product by its SEO slug.

## PromotionCode

The `PromotionCode` model represents promotional codes used for discounts.

#### Schema

```typescript
{
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  usageLimit: { type: Number, default: 0 },
  usageCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}
```

#### Fields Explanation

- `code`: A unique string representing the promotion code.
- `discountType`: The type of discount, either 'percentage' or 'fixed' amount.
- `discountValue`: The value of the discount.
- `validFrom`: The date from which the code becomes valid.
- `validUntil`: The expiration date of the code.
- `usageLimit`: The maximum number of times the code can be used (0 for unlimited).
- `usageCount`: The number of times the code has been used.
- `isActive`: Indicates whether the code is currently active.

## RevokedToken

The `RevokedToken` model keeps track of revoked authentication tokens.

#### Schema

```typescript
{
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true }
}
```

#### Fields Explanation

- `token`: The unique identifier of the revoked token.
- `expiresAt`: The date and time when the token expires.

## SiteSettings

The `SiteSettings` model stores global site configuration settings.

#### Schema

```typescript
{
  siteName: { type: String, required: true, default: "My Site" },
  siteDescription: { type: String, required: true, default: "Welcome to my site" },
  siteKeywords: [{ type: String }],
  socialMediaLinks: {
    facebook: String,
    twitter: String,
    instagram: String,
  },
  logoUrl: { type: String, default: "/default-logo.png" },
}
```

#### Fields Explanation

- `siteName`: The name of the website.
- `siteDescription`: A brief description of the website.
- `siteKeywords`: An array of keywords relevant to the website.
- `socialMediaLinks`: An object containing social media profile URLs.
- `logoUrl`: The URL of the website's logo image.

## Tag

The `Tag` model represents tags that can be associated with products.

#### Schema

```typescript
{
  name: { type: String, required: true, unique: true },
  description: { type: String },
}
```

#### Fields Explanation

- `name`: The unique name of the tag.
- `description`: An optional description of the tag.

## User

The `User` model represents user accounts in the application.

#### Schema

```typescript
{
  isAnonymous: { type: Boolean, default: false },
  username: { 
    type: String, 
    unique: true,
    sparse: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zAZ0-9_-]+$/, 'Username can only contain letters, numbers, underscores and hyphens']
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
  oneTimeLoginToken: { type: String },
  oneTimeLoginExpires: Date,
  deactivationToken: { type: String },
  deactivationExpires: Date,
  role: { type: String, enum: ['client', 'owner', 'admin'], default: 'client' },
  wishlist: [{ type: Types.ObjectId, ref: 'Product' }],
  shippingAddresses: [{ type: Types.ObjectId, ref: 'Address' }],
  notificationPreferences: {
    email: { type: Boolean, default: true },
    newsletters: { type: Boolean, default: false },
    orderUpdates: { type: Boolean, default: true },
  },
  lastTimeActive: Date,
  deactivated: Date,
}
```

#### Fields Explanation

- `isAnonymous`: Indicates if this is an anonymous user account.
- `username`: The user's unique username with validation rules.
- `email`: The user's email address (stored encrypted).
- `emailHash`: A hash of the email for faster lookups.
- `password`: The user's hashed password.
- `profilePicture`: URL of the user's profile picture.
- `isVerified`: Indicates if the user's email is verified.
- `verificationToken` and `verificationTokenExpires`: Used for email verification process.
- `resetPasswordToken` and `resetPasswordExpires`: Used for password reset process.
- `oneTimeLoginToken` and `oneTimeLoginExpires`: Used for magic link authentication.
- `deactivationToken` and `deactivationExpires`: Used for account deactivation process.
- `role`: The user's role in the system (client, owner, or admin).
- `wishlist`: An array of product IDs in the user's wishlist.
- `shippingAddresses`: An array of references to the user's shipping addresses.
- `notificationPreferences`: User's preferences for different types of notifications.
- `lastTimeActive`: Timestamp of the user's last activity.
- `deactivated`: Timestamp of when the account was deactivated, if applicable.

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
