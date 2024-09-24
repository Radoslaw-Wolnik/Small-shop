# Small Shop API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Admin Routes](#admin-routes)
3. [Owner Routes](#owner-routes)
4. [Newsletter Routes](#newsletter-routes)
5. [Order Routes](#order-routes)
6. [Product Routes](#product-routes)
7. [Category Routes](#category-routes)
8. [User Routes](#user-routes)
9. [Variant Routes](#variant-routes)
10. [Tag Routes](#tag-routes)
11. [Dispute Routes](#dispute-routes)

## Authentication

Most endpoints require authentication. Authentication is handled using HTTP-only cookies. When a user logs in successfully, the server will set a secure, HTTP-only cookie containing a session identifier. This cookie will be automatically included in subsequent requests to authenticated endpoints. Authentication requirement is indicated for each endpoint as follows:
 
 - 🔓 No authentication required
 - 🔒 User authentication required
 - 🎟️ Magic link (token) required
 - 👑 Owner authentication required
 - 🔑 Admin authentication required

## Admin Routes

### Create Owner Account
```
🔑 POST /api/admin/create-owner
Body: {
  "username": string,
  "email": string,
  "password": string
}
```

### Delete Inactive Users
```
🔑 DELETE /api/admin/inactive-users
Query: {
  "inactiveSince": Date // Optional, default might be 6 months
}
```

### Delete Product
```
🔑 DELETE /api/admin/products/:productId
```

### Update Sensitive Data
```
🔑 PUT /api/admin/sensitive-data
Body: {
  "shipmentFromAddress": string,
  "apiKeys": {
    "shipment": string,
    "payment": string
  },
  "shipmentPasswords": {
    "dhl": string,
    "fedex": string
  }
}
```

## Owner Routes

### Create Product
```
👑 POST /api/owner/products
Body: {
  "name": string,
  "description": string,
  "price": number,
  "category": string,
  "tags": string[],
  "variants": [
    {
      "name": string,
      "options": string[]
    }
  ],
  "templateId": string // Optional
}
```

### Create Product Template
```
👑 POST /api/owner/product-templates
Body: {
  "name": string,
  "category": string,
  "tags": string[],
  "variants": [
    {
      "name": string,
      "options": string[]
    }
  ]
}
```

### Create Variant
```
👑 POST /api/owner/variants
Body: {
  "name": string,
  "options": string[],
  "changesPhoto": boolean,
  "changesPrice": boolean
}
```

### Create Tag
```
👑 POST /api/owner/tags
Body: {
  "name": string
}
```

### Upload Product Photos
```
👑 POST /api/owner/products/:productId/photos
Body: FormData
  - photos: File[]
  - variantOption: string // If applicable
```

### Create Promotion
```
👑 POST /api/owner/promotions
Body: {
  "code": string,
  "discountType": "percentage" | "fixed",
  "discountValue": number,
  "startDate": Date,
  "endDate": Date,
  "applicableProducts": string[] // Product IDs
}
```

### Update Order Status to Shipped
```
👑 PUT /api/owner/orders/:orderId/ship
```

### Update Order Shipment Number
```
👑 PUT /api/owner/orders/:orderId/shipment-number
Body: {
  "shipmentNumber": string
}
```

### Deny Order
```
👑 PUT /api/owner/orders/:orderId/deny
Body: {
  "reason": string
}
```

### Cancel Promotion
```
👑 DELETE /api/owner/promotions/:promotionId
```

## Newsletter Routes

### Create Newsletter
```
👑 POST /api/newsletters
Body: {
  "title": string,
  "content": string,
  "products": string[], // Optional
  "promoCode": string, // Optional
  "scheduledDate": Date
}
```

### Update Newsletter
```
👑 PUT /api/newsletters/:newsletterId
Body: {
  "title": string,
  "content": string,
  "products": string[], // Optional
  "promoCode": string, // Optional
  "scheduledDate": Date
}
```

### Delete Newsletter
```
👑 DELETE /api/newsletters/:newsletterId
```

## Order Routes

### Create Order
```
🔓/🔒 POST /api/orders
Body: {
  "products": [
    {
      "productId": string,
      "quantity": number,
      "selectedVariants": { [key: string]: string }
    }
  ],
  "shippingAddress": {
    "street": string,
    "city": string,
    "state": string,
    "country": string,
    "zipCode": string
  },
  "paymentMethod": string,
  "email": string // Required for non-logged-in users
}
```

### Cancel Order
```
🔒/🎟️ PUT /api/orders/:orderId/cancel
```

### Dispute Order
```
🔒/🎟️ POST /api/orders/:orderId/dispute
Body: {
  "reason": string,
  "description": string
}
```

### Mark Order as Received
```
🔒/🎟️ PUT /api/orders/:orderId/received
```

### Get User Order History
```
🔒 GET /api/orders/history
Query: {
  "page": number,
  "limit": number
}
```

### Get Order Details
```
🔒/🎟️ GET /api/orders/:orderId
```

### Get Order Statistics (Owner)
```
👑 GET /api/owner/order-statistics
Query: {
  "status": string, // Optional, to filter by status
  "startDate": Date,
  "endDate": Date
}
```

### Search Orders (Owner)
```
👑 GET /api/owner/orders/search
Query: {
  "product": string, // Optional
  "variant": string, // Optional
  "status": string, // Optional
  "page": number,
  "limit": number
}
```

## Product Routes

### List Products
```
🔓 GET /api/products
Query: {
  "category": string, // Optional
  "tags": string[], // Optional
  "page": number,
  "limit": number
}
```

### Get Product Details
```
🔓 GET /api/products/:productId
```

### Update Product (Owner)
```
👑 PUT /api/owner/products/:productId
Body: {
  "name": string,
  "description": string,
  "price": number,
  "category": string,
  "tags": string[],
  "variants": [
    {
      "name": string,
      "options": string[]
    }
  ]
}
```

## Category Routes

### Create Category (Owner)
```
👑 POST /api/owner/categories
Body: {
  "name": string,
  "description": string
}
```

### Delete Category (Owner)
```
👑 DELETE /api/owner/categories/:categoryId
```

## User Routes

### Update Profile Picture
```
🔒 PUT /api/users/profile-picture
Body: FormData
  - profilePicture: File
```

### Add Shipping Address
```
🔒 POST /api/users/shipping-address
Body: {
  "label": string,
  "street": string,
  "city": string,
  "state": string,
  "country": string,
  "zipCode": string
}
```

### Update Shipping Address
```
🔒 PUT /api/users/shipping-address/:addressId
Body: {
  "label": string,
  "street": string,
  "city": string,
  "state": string,
  "country": string,
  "zipCode": string
}
```

## Variant Routes

### Update Variant (Owner)
```
👑 PUT /api/owner/variants/:variantId
Body: {
  "name": string,
  "options": string[],
  "changesPhoto": boolean,
  "changesPrice": boolean
}
```

### Delete Variant (Owner)
```
👑 DELETE /api/owner/variants/:variantId
```

## Tag Routes

### Delete Tag (Owner)
```
👑 DELETE /api/owner/tags/:tagId
```

## Dispute Routes

### Get Dispute Details
```
🔒/🎟️ GET /api/disputes/:disputeId
```

### Update Dispute (Owner)
```
👑 PUT /api/owner/disputes/:disputeId
Body: {
  "status": "under review" | "resolved",
  "resolution": string
}
```