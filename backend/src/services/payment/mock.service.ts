// src/services/payment/mock-payment.service.ts

import { IOrderDocument } from '../../models/order.model';
import { PaymentError } from '../../utils/custom-errors.util';

export async function processMockPayment(order: IOrderDocument): Promise<{ success: boolean; transactionId: string }> {
  try {
    // Simulate a payment process
    const success = Math.random() > 0.1; // 90% success rate
    const transactionId = `MOCK${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    if (success) {
      return { success: true, transactionId };
    } else {
      throw new PaymentError('Mock payment failed');
    }
  } catch (error) {
    throw new PaymentError('Failed to process mock payment');
  }
}

export async function verifyMockPayment(transactionId: string): Promise<{ verified: boolean; amount: number }> {
  try {
    // Simulate payment verification
    const verified = Math.random() > 0.05; // 95% verification rate
    return {
      verified,
      amount: verified ? Math.floor(Math.random() * 10000) / 100 : 0
    };
  } catch (error) {
    throw new PaymentError('Failed to verify mock payment');
  }
}