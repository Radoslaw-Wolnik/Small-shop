import { IOrderDocument } from '../models/order.model';

export const formatOrderDetails = (order: IOrderDocument): string => {
  let details = `Order ID: ${order._id}\n`;
  details += `Total Amount: $${order.totalAmount.toFixed(2)}\n\n`;
  details += 'Products:\n';

  // ew have here only product ids
  order.products.forEach((item, index) => {
    details += `${index + 1}. ${item}\n`; // item.product.name but we should somehow join/fetch the names
    details += `   Quantity: ${item.quantity}\n`;
    details += `   Price: $${item.price.toFixed(2)}\n`;
    if (Object.keys(item.selectedVariants).length > 0) {
      details += '   Variants:\n';
      for (const [key, value] of Object.entries(item.selectedVariants)) {
        details += `     - ${key}: ${value}\n`;
      }
    }
    details += '\n';
  });

  details += `Shipping Address: ${order.shippingAddress}\n`;
  details += `Shipping Method: ${order.shippingMethod}\n`;
  details += `Payment Method: ${order.paymentMethod}\n`;
  details += `Order Status: ${order.status}\n`;

  return details;
};