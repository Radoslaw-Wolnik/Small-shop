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
11. [Product Template Routes](#product-template-routes)
12. [Product Routes](#product-routes)
13. [Promotion Routes](#promotion-routes)
14. [Shipping Routes](#shipping-routes)
15. [Tag Routes](#tag-routes)
16. [User Routes](#user-routes)
17. [Variant Routes](#variant-routes)

## Authentication

Most endpoints require authentication. Authentication is handled using HTTP-only cookies. When a user logs in successfully, the server will set a secure, HTTP-only cookie containing a session identifier. This cookie will be automatically included in subsequent requests to authenticated endpoints. Authentication requirement is indicated for each endpoint as follows:
 
 - 🔓 No authentication required
 - 🎟️ Token (magic link) required
 - 🔒 User authentication required
 - 👑 Owner authentication required
 - 🔑 Admin authentication required


## Admin Routes

### Get All Admins
```
🔑 GET /api/admin/admins
Response: 
```

### Get All Users
```
🔑 GET /api/admin/users
Response: 
```

### Delete Admin
```
🔑 DELETE /api/admin/:id
Response: 
```

### Add Admin
```
🔑 POST /api/admin/add
Body: {
  // Add required fields
}
Response: 
```

### Update Email Template
```
🔑 PUT /api/admin/email-template/:id
Body: {
  // Add required fields
}
Response: 
```

### Delete Product
```
🔑 DELETE /api/admin/product/:id
Response: 
```

### Delete Inactive Users
```
🔑 DELETE /api/admin/inactive-users
Response: 
```

### Update Sensitive Data
```
🔑 PUT /api/admin/sensitive-data
Body: {
  // Add required fields
}
Response: 
```

## Auth Routes

### Register
```
🔓 POST /api/auth/register
Body: {
  // Add required fields
}
Response: 
```

### Login
```
🔓 POST /api/auth/login
Body: {
  // Add required fields
}
Response: 
```

### Post-Registration Login
```
🔓 POST /api/auth/reg-login
Body: {
  // Add required fields
}
Response: 
```

### Logout
```
🔒 POST /api/auth/logout
Response: 
```

### Refresh Token
```
🔒 POST /api/auth/refresh-token
Response: 
```

### Send Verification Email
```
🔒 POST /api/auth/send-verification
Response: 
```

### Verify Email
```
🔓 GET /api/auth/verify-email/:token
Response: 
```

### Change Password
```
🔒 PUT /api/auth/change-password
Body: {
  // Add required fields
}
Response: 
```

### Request Password Reset
```
🔓 POST /api/auth/request-password-reset
Body: {
  // Add required fields
}
Response: 
```

### Reset Password
```
🔓 POST /api/auth/reset-password/:token
Body: {
  // Add required fields
}
Response: 
```

### Create Owner Account
```
🔑 POST /api/auth/create-owner
Body: {
  // Add required fields
}
Response: 
```

## Category Routes

### Get Categories
```
🔓 GET /api/categories
Response: 
```

### Create Category
```
👑 POST /api/categories
Body: {
  // Add required fields
}
Response: 
```

### Update Category
```
👑 PUT /api/categories/:id
Body: {
  // Add required fields
}
Response: 
```

### Delete Category
```
👑 DELETE /api/categories/:id
Response: 
```

## Dispute Routes

### Get Dispute Details
```
🔒 GET /api/disputes/:id
Response: 
```

### List Disputes
```
👑 GET /api/disputes
Response: 
```

### Create Dispute
```
🔒 POST /api/disputes/:orderId
Body: {
  // Add required fields
}
Response: 
```

### Update Dispute Status
```
👑 PUT /api/disputes/:id/status
Body: {
  // Add required fields
}
Response: 
```

### Delete Dispute
```
👑 DELETE /api/disputes/:id
Response: 
```

## Health Routes

### Basic Health Check
```
🔓 GET /api/health
Response: 
```

### Detailed Health Check
```
🔓 GET /api/health/details
Response: 
```

## Message Routes

### Create Message
```
🔒 POST /api/messages
Body: {
  // Add required fields
}
Response: 
```

### Get Messages
```
👑 GET /api/messages
Response: 
```

### Mark Message as Read
```
👑 PUT /api/messages/:id/read
Response: 
```

## Newsletter Routes

### Create Newsletter
```
👑 POST /api/newsletters
Body: {
  // Add required fields
}
Response: 
```

### Update Newsletter
```
👑 PUT /api/newsletters/:id
Body: {
  // Add required fields
}
Response: 
```

### Delete Newsletter
```
👑 DELETE /api/newsletters/:id
Response: 
```

### Schedule Newsletter
```
👑 PUT /api/newsletters/:id/schedule
Body: {
  // Add required fields
}
Response: 
```

### Send Newsletter
```
👑 POST /api/newsletters/:id/send
Response: 
```

### Get Subscribers
```
👑 GET /api/newsletters/subscribers
Response: 
```

## Order Routes

### Create Anonymous Order
```
🔓 POST /api/orders/anon
Body: {
  // Add required fields
}
Response: 
```

### Get Order Details (Anonymous)
```
🎟️ GET /api/orders/:orderId/:token
Response: 
```

### Cancel Order (Anonymous)
```
🎟️ PUT /api/orders/cancel/:orderId/:token
Response: 
```

### Mark Order as Received (Anonymous)
```
🎟️ PUT /api/orders/received/:orderId/:token
Response: 
```

### Create Order (Authenticated)
```
🔒 POST /api/orders
Body: {
  // Add required fields
}
Response: 
```

### Get Order Details (Authenticated)
```
🔒 GET /api/orders/:id
Response: 
```

### Cancel Order (Authenticated)
```
🔒 PUT /api/orders/:orderId/cancel
Response: 
```

### Mark Order as Received (Authenticated)
```
🔒 PUT /api/orders/:orderId/received
Response: 
```

### Get User Order History
```
🔒 GET /api/orders
Response: 
```

### Get All Orders (Owner)
```
👑 GET /api/orders
Response: 
```

### Update Order Status (Owner)
```
👑 PUT /api/orders/:id/status
Body: {
  // Add required fields
}
Response: 
```

### Deny Order (Owner)
```
👑 PUT /api/orders/:orderId/deny
Body: {
  // Add required fields
}
Response: 
```

### Get Order Statistics (Owner)
```
👑 GET /api/orders/statistics
Response: 
```

### Search Orders (Owner)
```
👑 GET /api/orders/search
Query Parameters: {
  // Add query parameters
}
Response: 
```

## Payment Routes

### Initialize Payment
```
🔒 POST /api/payments/initialize
Body: {
  // Add required fields
}
Response: 
```

### Handle Payment Callback
```
🔓 POST /api/payments/callback/:gateway
Body: {
  // Add required fields
}
Response: 
```

### Get Payment Status (Authenticated)
```
🔒 GET /api/payments/status/:orderId
Response: 
```

### Process Payment (Anonymous)
```
🔓 POST /api/payments/process
Body: {
  // Add required fields
}
Response: 
```

### Get Payment Status (Anonymous)
```
🎟️ GET /api/payments/status/:orderId/:token
Response: 
```

## Product Template Routes

### Get Product Templates
```
🔓 GET /api/product-templates
Response: 
```

### Create Product Template
```
👑 POST /api/product-templates
Body: {
  // Add required fields
}
Response: 
```

### Update Product Template
```
👑 PUT /api/product-templates/:id
Body: {
  // Add required fields
}
Response: 
```

### Delete Product Template
```
👑 DELETE /api/product-templates/:id
Response: 
```

## Product Routes

### Get Products
```
🔓 GET /api/products
Response: 
```

### Get Products by Tags
```
🔓 GET /api/products/tags
Query Parameters: {
  // Add query parameters
}
Response: 
```

### Get Products by Category
```
🔓 GET /api/products/category
Query Parameters: {
  // Add query parameters
}
Response: 
```

### Get Products by Tags and Category
```
🔓 GET /api/products/category/tags
Query Parameters: {
  // Add query parameters
}
Response: 
```

### Get Product Details
```
🔓 GET /api/products/:id
Response: 
```

### Create Product
```
👑 POST /api/products
Body: {
  // Add required fields
}
Response: 
```

### Update Product
```
👑 PUT /api/products/:id
Body: {
  // Add required fields
}
Response: 
```

### Delete Product
```
👑 DELETE /api/products/:id
Response: 
```

### Add Variant
```
👑 POST /api/products/:productId/variants
Body: {
  // Add required fields
}
Response: 
```

### Update Inventory
```
👑 PUT /api/products/:productId/inventory
Body: {
  // Add required fields
}
Response: 
```

### Update Shipping Details
```
👑 PUT /api/products/:productId/shipping
Body: {
  // Add required fields
}
Response: 
```

### Update Variant Photos
```
👑 PUT /api/products/:productId/variant-photos
Body: {
  // Add required fields
}
Response: 
```

### Upload Product Photos
```
👑 POST /api/products/:productId/photos
Body: FormData
Response: 
```

### Add Tag to Product
```
👑 POST /api/products/:productId/add
Body: {
  // Add required fields
}
Response: 
```

### Remove Tag from Product
```
👑 DELETE /api/products/:productId/remove
Body: {
  // Add required fields
}
Response: 
```

## Promotion Routes

### Create Promotion
```
👑 POST /api/promotions
Body: {
  // Add required fields
}
Response: 
```

### Update Promotion
```
👑 PUT /api/promotions/:id
Body: {
  // Add required fields
}
Response: 
```

### Delete Promotion
```
👑 DELETE /api/promotions/:id
Response: 
```

### List Promotions
```
👑 GET /api/promotions
Response: 
```

## Shipping Routes

### Generate Shipping Label
```
👑 POST /api/shipping/generate-label/:orderId
Body: {
  // Add required fields
}
Response: 
```

### Track Shipment
```
🔒 GET /api/shipping/track/:orderId
Response: 
```

### Update Shipping Status
```
👑 PUT /api/shipping/status/:orderId
Body: {
  // Add required fields
}
Response: 
```

### Get Shipment Tracking
```
🔓 GET /api/shipping/:trackingNumber
Response: 
```

## Tag Routes

### List Tags
```
🔓 GET /api/tags
Response: 
```

### Create Tag
```
👑 POST /api/tags
Body: {
  // Add required fields
}
Response: 
```

### Update Tag
```
👑 PUT /api/tags/:id
Body: {
  // Add required fields
}
Response: 
```

### Delete Tag
```
👑 DELETE /api/tags/:id
Response: 
```

## User Routes

### Get User's Own Profile
```
🔒 GET /api/users/me
Response: 
```

### Upload Profile Picture
```
🔒 PUT /api/users/upload-profile-picture
Body: FormData
Response: 
```

### Update Profile
```
🔒 PUT /api/users/profile
Body: {
  // Add required fields
}
Response: 
```

### Add to Wishlist
```
🔒 POST /api/users/wishlist
Body: {
  // Add required fields
}
Response: 
```

### Remove from Wishlist
```
🔒 DELETE /api/users/wishlist/:productId
Response: 
```

### Add Shipping Info
```
🔒 POST /api/users/shipping-info
Body: {
  // Add required fields
}
Response: 
```

### Update Shipping Info
```
🔒 PUT /api/users/shipping-info/:id
Body: {
  // Add required fields
}
Response: 
```

### Deactivate User Profile
```
🎟️ DELETE /api/users/me/:token
Response: 
```

## Variant Routes

### Get Variant Details
```
🔓 GET /api/variants/:id
Response: 
```

### Create Variant
```
👑 POST /api/variants
Body: {
  // Add required fields
}
Response: 
```

### Update Variant
```
👑 PUT /api/variants/:id
Body: {
  // Add required fields
}
Response: 
```

### Delete Variant
```
👑 DELETE /api/variants/:id
Response: 
```

### Get Variants
```
👑 GET /api/variants
Response: 
```