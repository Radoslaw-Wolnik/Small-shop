import Order, { IOrderDocument } from '../models/order.model';
import { PaymentError, NotFoundError, UnauthorizedError } from '../utils/custom-errors.util';
import { initializePayPalPayment, verifyPayPalPayment } from './payment/paypal.service';
import { initializePrzelewy24Payment, verifyPrzelewy24Payment } from './payment/przelewy24.service';
import { initializePayUPayment, verifyPayUPayment } from './payment/payU.service';
import { processStripePayment, verifyStripePayment } from './payment/stripe.service';
import { IdempotencyService } from './idempotency.service';
import { SecureDataService } from './secure-data.service';
import environment from '../config/environment';
// Example usage of SecureDataService in PaymentService for encrypting sensitive data


export class PaymentService {
    constructor(private idempotencyService: IdempotencyService, private secureDataService: SecureDataService) {}

  // Centralized payment initialization logic
  async initializePayment(orderId: string, gateway: string, idempotencyKey: string): Promise<PaymentInitializationResult> {
    return this.idempotencyService.execute(idempotencyKey, async () => {
      const order = await this.getOrder(orderId);
      
      const result = await this.initializePaymentGateway(order, gateway);
      
      // Encrypt sensitive payment details
      const encryptedData = await this.secureDataService.encrypt(result.transactionId);
      
      // Store encrypted transaction ID in the order
      order.transactionId = encryptedData;
      await order.save();
      
      return result;
    });
  }

  private async initializePaymentGateway(order: IOrderDocument, gateway: string) {
    switch (gateway) {
      case 'paypal':
        return await initializePayPalPayment(order);
      case 'przelewy24':
        return await initializePrzelewy24Payment(order);
      case 'payu':
        return await initializePayUPayment(order);
      case 'stripe':
        return await processStripePayment(order);
      default:
        throw new PaymentError('Invalid payment gateway');
    }
  }

  // Centralized payment verification logic
  async verifyPayment(gateway: string, paymentData: any): Promise<PaymentVerificationResult> {
    switch (gateway) {
      case 'paypal':
        return await verifyPayPalPayment(paymentData.transactionId);
      case 'przelewy24':
        return await verifyPrzelewy24Payment(paymentData.sessionId, paymentData.orderId, paymentData.amount, paymentData.currency, paymentData.signature);
      case 'payu':
        return await verifyPayUPayment(paymentData);
      case 'stripe':
        return await verifyStripePayment(paymentData.transactionId);
      default:
        throw new PaymentError('Invalid payment gateway');
    }
  }

  // Private helper to fetch order details
  private async getOrder(orderId: string): Promise<IOrderDocument> {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    return order;
  }
}
