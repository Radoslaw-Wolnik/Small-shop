// src/services/payment/mock-payment.service.ts

import { IOrderDocument } from '../../models/order.model';
import { PaymentError } from '../../utils/custom-errors.util';

export async function processMockPayment(order: IOrderDocument): Promise<PaymentInitializationResult> {
  try {
    // Simulate a payment process
    const success = Math.random() > 0.1; // 90% success rate
    const transactionId = `MOCK${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    if (success) {
      return {
        success: true,
        transactionId,
        paymentUrl: `https://mock-payment-gateway.com/pay/${transactionId}`
      };
    } else {
      throw new PaymentError('Mock payment failed');
    }
  } catch (error) {
    throw new PaymentError('Failed to process mock payment');
  }
}

export async function verifyMockPayment(transactionId: string): Promise<PaymentVerificationResult> {
  try {
    // Simulate payment verification
    const verified = Math.random() > 0.05; // 95% verification rate
    return {
      success: verified,
      orderId: transactionId.substring(4) // Mock orderId based on transactionId
    };
  } catch (error) {
    throw new PaymentError('Failed to verify mock payment');
  }
}