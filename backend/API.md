# Small Shop API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Admin Routes](#admin-routes)
3. [Auth Routes](#auth-routes)
4. [Category Routes](#category-routes)
5. [Dispute Routes](#dispute-routes)
6. [Health Routes](#health-routes)
7. [Message Routes](#message-routes)
8. [Newsletter Routes](#newsletter-routes)
9. [Order Routes](#order-routes)
10. [Payment Routes](#payment-routes)
11. [Product Routes](#product-routes)
12. [Promotion Routes](#promotion-routes)
13. [Shipping Routes](#shipping-routes)
14. [Site Settings Routes](#site-settings-routes)
15. [Tag Routes](#tag-routes)
16. [User Routes](#user-routes)
17. [Variant Routes](#variant-routes)
18. [Job Routes](#job-routes)

## Authentication

Most endpoints require authentication. Authentication is handled using HTTP-only cookies. When a user logs in successfully, the server will set a secure, HTTP-only cookie containing a session identifier. This cookie will be automatically included in subsequent requests to authenticated endpoints. Authentication requirement is indicated for each endpoint as follows:
 
 - 🔓 No authentication required
 - 🎟️ Token (magic link) required
 - 🔒 User authentication required
 - 👑 Owner authentication required
 - 🔑 Admin authentication required

## Admin Routes

#### Get All Admins
```
🔑 GET /api/admin/admins
Response: [Admin]
```

#### Get All Users
```
🔑 GET /api/admin/users
Response: [User]
```

#### Delete Admin
```
🔑 DELETE /api/admin/:id
Response: { message: "Admin deleted successfully" }
```

#### Add Admin
```
🔑 POST /api/admin/add
Body: { username: string, email: string, password: string }
Response: { message: "Admin added successfully", admin: Admin }
```

#### Update Email Template
```
🔑 PUT /api/admin/email-template/:id
Body: { subject: string, htmlBody: string, textBody: string }
Response: { message: "Email template updated successfully" }
```

#### Delete Product
```
🔑 DELETE /api/admin/product/:id
Response: { message: "Product deleted successfully" }
```

#### Delete Inactive Users
```
🔑 DELETE /api/admin/inactive-users
Response: { message: "Inactive users deleted successfully", count: number }
```

#### Update Sensitive Data
```
🔑 PUT /api/admin/sensitive-data
Body: { config: object }
Response: { message: "Configuration updated successfully", config: object }
```

#### Get Email Templates
```
🔑 GET /api/admin/email-templates
Response: [string]
```

## Auth Routes

#### Register
```
🔓 POST /api/auth/register
Body: { username: string, email: string, password: string }
Response: { message: "User registered successfully" }
```

#### Login
```
🔓 POST /api/auth/login
Body: { email: string, password: string }
Response: { message: "Login successful", user: { id: string, role: string } }
```

#### Post-Registration Login
```
🔓 POST /api/auth/reg-login
Response: { message: "Login successful", user: { id: string, role: string, isVerified: boolean } }
```

#### Logout
```
🔒 POST /api/auth/logout
Response: { message: "Logout successful" }
```

#### Refresh Token
```
🔒 POST /api/auth/refresh-token
Response: { message: "Token refreshed successfully", user: { id: string, role: string } }
```

#### Send Verification Email
```
🔒 POST /api/auth/send-verification
Response: { message: "Verification email sent" }
```

#### Verify Email
```
🔓 GET /api/auth/verify-email/:token
Response: { message: "Email verified successfully" }
```

#### Change Password
```
🔒 PUT /api/auth/change-password
Body: { currentPassword: string, newPassword: string }
Response: { message: "Password changed successfully" }
```

#### Request Password Reset
```
🔓 POST /api/auth/request-password-reset
Body: { email: string }
Response: { message: "Password reset email sent" }
```

#### Reset Password
```
🔓 POST /api/auth/reset-password/:token
Body: { password: string }
Response: { message: "Password reset successful" }
```

#### Create Owner Account
```
🔑 POST /api/auth/create-owner
Body: { username: string, email: string, password: string }
Response: { message: "Owner account created successfully", ownerId: string }
```

#### Create Magic Link
```
🔓 POST /api/auth/magic-link
Body: { email: string }
Response: { message: "Magic link sent to your email" }
```

#### Login with Magic Link
```
🔓 GET /api/auth/magic-login/:token
Response: { message: "Login successful", user: { id: string, role: string } }
```

#### Request Account Deactivation
```
🔒 POST /api/auth/request-deactivation
Response: { message: "Account deactivation email sent" }
```

#### Deactivate Account
```
🔓 POST /api/auth/deactivate/:token
Response: { message: "Account deactivated successfully" }
```

## Category Routes

#### Get Categories
```
🔓 GET /api/categories
Response: [Category]
```

#### Create Category
```
👑 POST /api/categories
Body: { name: string, description: string, parent?: string, seo: object }
Response: Category
```

#### Update Category
```
👑 PUT /api/categories/:id
Body: { name?: string, description?: string, parent?: string, seo?: object }
Response: Category
```

#### Delete Category
```
👑 DELETE /api/categories/:id
Response: { message: "Category deleted successfully" }
```

## Dispute Routes

#### Create Dispute with Token
```
🎟️ POST /api/disputes/:orderId/:token
Body: { reason: string, description: string, attachments?: [string] }
Response: Dispute
```

#### Get Dispute Details
```
🔒 GET /api/disputes/:id
Response: Dispute
```

#### List Disputes
```
👑 GET /api/disputes
Response: [Dispute]
```

#### Update Dispute Status
```
👑 PUT /api/disputes/:id/status
Body: { status: string, resolution?: string }
Response: Dispute
```

#### Delete Dispute
```
👑 DELETE /api/disputes/:id
Response: { message: "Dispute deleted successfully" }
```

#### Add Attachment to Dispute
```
🔒 POST /api/disputes/upload/:id
Body: FormData
Response: Dispute
```

## Health Routes

#### Basic Health Check
```
🔓 GET /api/health/basic
Response: { status: "OK" }
```

#### Detailed Health Check
```
🔓 GET /api/health/details
Response: { 
  uptime: number,
  message: string,
  timestamp: number,
  database: string
}
```

## Message Routes

#### Create Message
```
🔒 POST /api/messages
Body: { content: string, category: string, relatedOrder?: string, relatedDispute?: string, attachments?: [string] }
Response: Message
```

#### Get Messages
```
👑 GET /api/messages
Response: [Message]
```

#### Mark Message as Read
```
👑 PUT /api/messages/:id/read
Response: Message
```

#### Add Photos to Message
```
🔒 POST /api/messages/upload/:id
Body: FormData
Response: Message
```

## Newsletter Routes

#### Create Newsletter
```
👑 POST /api/newsletters
Body: { title: string, content: string, scheduledDate: Date }
Response: Newsletter
```

#### Update Newsletter
```
👑 PUT /api/newsletters/:id
Body: { title?: string, content?: string, scheduledDate?: Date }
Response: Newsletter
```

#### Delete Newsletter
```
👑 DELETE /api/newsletters/:id
Response: { message: "Newsletter deleted successfully" }
```

#### Schedule Newsletter
```
👑 PUT /api/newsletters/:id/schedule
Body: { scheduledDate: Date }
Response: Newsletter
```

#### Send Newsletter
```
👑 POST /api/newsletters/:id/send
Response: { message: "Newsletter sent successfully", recipientCount: number }
```

#### Get Subscribers
```
👑 GET /api/newsletters/subscribers
Response: [User]
```

## Order Routes

#### Create Order
```
🔒 POST /api/orders
Body: { products: [{ product: string, quantity: number, selectedVariants: object }], shippingAddress: string, shippingMethod: string, paymentMethod: string }
Response: Order
```

#### Get Order Details
```
🔒 GET /api/orders/:id
Response: Order
```

#### Get User Order History
```
🔒 GET /api/orders
Response: [Order]
```

#### Update Order Status
```
👑 PUT /api/orders/:id/status
Body: { status: string }
Response: Order
```

#### Cancel Order
```
🔒 PUT /api/orders/:orderId/cancel
Response: { message: "Order cancelled successfully" }
```

#### Get Order Statistics
```
👑 GET /api/orders/statistics
Response: { totalOrders: number, totalRevenue: number, ordersByStatus: object }
```

#### Search Orders
```
👑 GET /api/orders/search
Query Parameters: { query: string, page?: number, limit?: number }
Response: { orders: [Order], currentPage: number, totalPages: number, total: number }
```

## Payment Routes

#### Initialize Payment
```
🔒 POST /api/payments/initialize
Body: { orderId: string, gateway: string }
Response: { paymentUrl: string, transactionId: string }
```

#### Handle Payment Callback
```
🔓 POST /api/payments/callback/:gateway
Body: { /* Depends on the payment gateway */ }
Response: { message: "Payment verified successfully" }
```

#### Get Payment Status
```
🔒 GET /api/payments/status/:orderId
Response: { paymentStatus: string }
```

#### Verify Payment
```
🔒 POST /api/payments/verify/:orderId
Body: { /* Depends on the payment gateway */ }
Response: { message: "Payment verified successfully" }
```

## Product Routes

#### Get Products
```
🔓 GET /api/products
Query Parameters: { category?: string, tags?: [string], page?: number, limit?: number }
Response: { products: [Product], currentPage: number, totalPages: number, total: number }
```

#### Get Product Details
```
🔓 GET /api/products/:id
Response: Product
```

#### Create Product
```
👑 POST /api/products
Body: { name: string, description: string, category: string, basePrice: number, variants: [object], shippingDetails: object, seo: object }
Response: Product
```

#### Update Product
```
👑 PUT /api/products/:id
Body: { name?: string, description?: string, category?: string, basePrice?: number, variants?: [object], shippingDetails?: object, seo?: object }
Response: Product
```

#### Delete Product
```
👑 DELETE /api/products/:id
Response: { message: "Product deleted successfully" }
```

#### Add Variant
```
👑 POST /api/products/:productId/variants
Body: { variantId: string, options: [object] }
Response: Product
```

#### Remove Variant
```
👑 DELETE /api/products/:productId/variants/:variantId
Body: { deletePhotos?: boolean }
Response: Product
```

#### Update Inventory
```
👑 PUT /api/products/:productId/inventory
Body: { inventory: [object] }
Response: Product
```

#### Update Shipping Details
```
👑 PUT /api/products/:productId/shipping
Body: { shippingDetails: object }
Response: Product
```

#### Update Variant Photos
```
👑 PUT /api/products/:productId/variant-photos
Body: FormData
Response: Product
```

#### Save Product Photos
```
👑 POST /api/products/:productId/photos
Body: FormData
Response: Product
```

#### Add Tag
```
👑 POST /api/products/:productId/add
Body: { tagId: string }
Response: Product
```

#### Remove Tag
```
👑 DELETE /api/products/:productId/remove
Body: { tagId: string }
Response: Product
```

#### Copy Product
```
👑 POST /api/products/:productId/copy
Body: { newName: string }
Response: Product
```

## Promotion Routes

#### Create Promotion
```
👑 POST /api/promotions
Body: { code: string, discountType: string, discountValue: number, validFrom: Date, validUntil: Date, usageLimit: number }
Response: Promotion
```

#### Update Promotion
```
👑 PUT /api/promotions/:id
Body: { code?: string, discountType?: string, discountValue?: number, validFrom?: Date, validUntil?: Date, usageLimit?: number }
Response: Promotion
```

#### Delete Promotion
```
👑 DELETE /api/promotions/:id
Response: { message: "Promotion deleted successfully" }
```

#### List Promotions
```
👑 GET /api/promotions
Response: [Promotion]
```

## Shipping Routes

#### Generate Shipping Label
```
👑 POST /api/shipping/generate-label/:orderId
Body: { provider: string }
Response: { shippingLabel: string, trackingNumber: string }
```

#### Track Shipment
```
🔒 GET /api/shipping/track/:orderId
Response: { status: string, lastUpdate: Date, estimatedDelivery: Date }
```

#### Update Shipping Status
```
👑 PUT /api/shipping/status/:orderId
Body: { status: string }
Response: { message: "Shipping status updated successfully" }
```

## Site Settings Routes

#### Get Site Settings
```
🔓 GET /api/site-settings
Response: SiteSettings
```

#### Update Site Settings
```
🔑 PUT /api/site-settings
Body: { siteName?: string, siteDescription?: string, siteKeywords?: [string], socialMediaLinks?: object, logoUrl?: string }
Response: SiteSettings
```

#### Update SEO Settings
```
🔑 PUT /api/site-settings/seo
Body: { siteName?: string, siteDescription?: string, siteKeywords?: [string] }
Response: SiteSettings
```

#### Update Social Media Links
```
🔑 PUT /api/site-settings/social
Body: { socialMediaLinks: object }
Response: SiteSettings
```

#### Update Logo
```
🔑 PUT /api/site-settings/logo
Body: { logoUrl: string }
Response: SiteSettings
```

## Tag Routes

#### List Tags
```
🔓 GET /api/tags
Response: [Tag]
```

#### Create Tag
```
👑 POST /api/tags
Body: { name: string, description?: string }
Response: Tag
```

#### Update Tag
```
👑 PUT /api/tags/:id
Body: { name?: string, description?: string }
Response: Tag
```

#### Delete Tag
```
👑 DELETE /api/tags/:id
Response: { message: "Tag deleted successfully" }
```

## User Routes

#### Get User's Own Profile
```
🔒 GET /api/users/me
Response: User
```

#### Upload Profile Picture
```
🔒 PUT /api/users/upload-profile-picture
Body: FormData
Response: { message: "Profile picture updated successfully", profilePicture: string }
```

#### Update Profile
```
🔒 PUT /api/users/profile
Body: { /* User fields to update */ }
Response: User
```

#### Add to Wishlist
```
🔒 POST /api/users/wishlist
Body: { productId: string }
Response: User
```

#### Remove from Wishlist
```
🔒 DELETE /api/users/wishlist/:productId
Response: User
```

#### Add Shipping Info
```
🔒 POST /api/users/shipping-info
Body: { /* Shipping address details */ }
Response: [ShippingAddress]
```

#### Update Shipping Info
```
🔒 PUT /api/users/shipping-info/:id
Body: { /* Updated shipping address details */ }
Response: ShippingAddress
```

## Variant Routes

#### Get Variant Details
```
🔓 GET /api/variants/:id
Response: Variant
```

#### Create Variant
```
👑 POST /api/variants
Body: { name: string, changesPhoto: boolean, changesPrice: boolean, options: [string] }
Response: Variant
```

#### Update Variant
```
👑 PUT /api/variants/:id
Body: { name?: string, changesPhoto?: boolean, changesPrice?: boolean, options?: [string] }
Response: Variant
```

#### Delete Variant
```
👑 DELETE /api/variants/:id
Response: { message: "Variant deleted successfully" }
```

#### Get Variants
```
👑 GET /api/variants
Response: [Variant]
```

## Job Routes

#### Run Job
```
👑 POST /api/jobs/:jobName
Response: { message: "Job completed successfully" }
```

#### Get Job Status
```
👑 GET /api/jobs/:jobName/status
Response: { /* Job status details */ }
```
