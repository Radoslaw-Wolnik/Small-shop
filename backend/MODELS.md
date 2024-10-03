# Database Models

This document describes the database models used in the Small Shop application, including their fields and important functions.

## Table of Contents
1. [User](#user)
2. [Product](#product)
3. [Order](#order)
4. [Category](#category)
5. [Tag](#tag)
6. [Variant](#variant)
7. [Address](#address)
8. [Dispute](#dispute)
9. [Message](#message)
10. [Newsletter](#newsletter)
11. [PromotionCode](#promotioncode)
12. [RevokedToken](#revokedtoken)
13. [SiteSettings](#sitesettings)
14. [EmailTemplate](#emailtemplate)

## User

Represents a user in the system.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| isAnonymous | Boolean | Indicates if the user is anonymous |
| username | String | User's username (unique) |
| email | String | User's email (encrypted, unique) |
| emailHash | String | Hashed email for faster lookups |
| password | String | Hashed password |
| FirstName | String | User's first name |
| LastName | String | User's last name |
| Phone | String | User's phone number (optional) |
| profilePicture | String | URL to user's profile picture |
| isVerified | Boolean | Indicates if the user's email is verified |
| verificationToken | String | Token for email verification |
| verificationTokenExpires | Date | Expiration date for verification token |
| resetPasswordToken | String | Token for password reset |
| resetPasswordExpires | Date | Expiration date for password reset token |
| oneTimeLoginToken | String | Token for one-time login |
| oneTimeLoginExpires | Date | Expiration date for one-time login token |
| deactivationToken | String | Token for account deactivation |
| deactivationExpires | Date | Expiration date for deactivation token |
| role | String | User's role (client, owner, admin) |
| wishlist | [ObjectId] | Array of product IDs in user's wishlist |
| shippingAddresses | [ObjectId] | Array of user's shipping address IDs |
| notificationPreferences | Object | User's notification preferences |
| lastTimeActive | Date | Timestamp of user's last activity |
| deactivated | Date | Timestamp of account deactivation (if applicable) |

### Methods and Hooks

- `pre('save')`: Hashes password and encrypts email before saving
- `getDecryptedEmail()`: Decrypts and returns the user's email
- `comparePassword(candidatePassword)`: Compares a given password with the stored hashed password
- `findByEmail(email)`: Static method to find a user by their email

## Product

Represents a product in the shop.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| name | String | Product name |
| description | String | Product description |
| category | ObjectId | Reference to the product's category |
| tags | [ObjectId] | Array of tag IDs associated with the product |
| basePrice | Number | Base price of the product |
| variants | [Object] | Array of variant objects |
| defaultPhoto | String | URL of the default product photo |
| images | [Object] | Array of product image objects |
| inventory | [Object] | Array of inventory objects |
| shippingDetails | Object | Shipping details for the product |
| seo | Object | SEO-related information |
| isActive | Boolean | Indicates if the product is active |

### Methods and Hooks

- `pre('save')`: Generates SEO slug from the product name
- `getStructuredData()`: Returns structured data for the product (for SEO)
- `reserveInventory(variantCombination, quantity)`: Reserves inventory for a specific variant
- `releaseInventory(variantCombination, quantity)`: Releases previously reserved inventory
- `findBySlug(slug)`: Static method to find a product by its SEO slug

## Order

Represents a customer order.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| user | ObjectId | Reference to the user who placed the order |
| userInfo | Object | User information at the time of order |
| products | [Object] | Array of ordered product objects |
| totalAmount | Number | Total amount of the order |
| status | String | Current status of the order |
| shippingAddress | ObjectId | Reference to the shipping address |
| shippingMethod | String | Chosen shipping method |
| shippingProvider | String | Shipping provider (optional) |
| shippingLabel | String | Shipping label (optional) |
| trackingNumber | String | Tracking number (optional) |
| paymentMethod | String | Chosen payment method |
| paymentGateway | String | Payment gateway (optional) |
| paymentStatus | String | Current payment status |
| transactionId | String | Transaction ID (optional) |
| paymentUrl | String | Payment URL (optional) |
| promoCodeUsed | String | Promo code used (optional) |
| disputeId | ObjectId | Reference to a dispute (optional) |
| anonToken | String | Token for anonymous orders (optional) |
| anonTokenExpires | Date | Expiration date for anonymous token |

## Category

Represents a product category.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| name | String | Category name (unique) |
| description | String | Category description |
| parent | ObjectId | Reference to parent category (optional) |
| seo | Object | SEO-related information |

### Methods and Hooks

- `pre('save')`: Generates SEO slug from the category name

## Tag

Represents a product tag.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| name | String | Tag name (unique) |
| description | String | Tag description (optional) |

## Variant

Represents a product variant.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| name | String | Variant name |
| changesPhoto | Boolean | Indicates if the variant changes the product photo |
| changesPrice | Boolean | Indicates if the variant affects the price |
| options | [String] | Array of variant options |

## Address

Represents a shipping address.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| user | ObjectId | Reference to the user |
| label | String | Address label |
| street | String | Street address |
| buildingNumber | String | Building number |
| city | String | City |
| state | String | State |
| country | String | Country |
| zipCode | String | ZIP code |
| isDefault | Boolean | Indicates if this is the default address |

## Dispute

Represents a dispute for an order.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| order | ObjectId | Reference to the disputed order |
| user | ObjectId | Reference to the user who opened the dispute |
| reason | String | Reason for the dispute |
| description | String | Detailed description of the dispute |
| status | String | Current status of the dispute |
| resolution | String | Resolution of the dispute (optional) |
| attachments | [Object] | Array of attachment objects |
| messages | [ObjectId] | Array of message IDs related to the dispute |

## Message

Represents a message in the system.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| sender | ObjectId | Reference to the sender |
| content | String | Message content |
| readStatus | Boolean | Indicates if the message has been read |
| category | String | Message category |
| relatedOrder | ObjectId | Reference to related order (optional) |
| relatedDispute | ObjectId | Reference to related dispute (optional) |
| relatedProduct | ObjectId | Reference to related product (optional) |
| attachments | [Object] | Array of attachment objects |

## Newsletter

Represents a newsletter.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| title | String | Newsletter title |
| content | String | Newsletter content |
| featuredProducts | [ObjectId] | Array of featured product IDs |
| scheduledDate | Date | Scheduled send date |
| sentDate | Date | Actual send date (optional) |
| recipients | [ObjectId] | Array of recipient user IDs |
| status | String | Current status of the newsletter |

## PromotionCode

Represents a promotional code.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| code | String | Promotion code (unique) |
| discountType | String | Type of discount (percentage or fixed) |
| discountValue | Number | Value of the discount |
| validFrom | Date | Start date of promotion |
| validUntil | Date | End date of promotion |
| usageLimit | Number | Maximum number of uses |
| usageCount | Number | Current number of uses |
| isActive | Boolean | Indicates if the promotion is active |

## RevokedToken

Represents a revoked JWT token.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| token | String | The revoked token (unique) |
| expiresAt | Date | Expiration date of the token |

## SiteSettings

Represents global site settings.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| siteName | String | Name of the site |
| siteDescription | String | Description of the site |
| siteKeywords | [String] | Array of site keywords |
| socialMediaLinks | Object | Social media links |
| logoUrl | String | URL of the site logo |

### Methods

- `findOneOrCreate(condition, doc)`: Static method to ensure only one document exists

## EmailTemplate

Represents an email template.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| name | String | Template name (unique) |
| subject | String | Email subject |
| htmlBody | String | HTML content of the email |
| textBody | String | Plain text content of the email |
| variables | [String] | Array of variable names used in the template |