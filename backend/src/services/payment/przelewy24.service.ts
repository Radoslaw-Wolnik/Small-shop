// src/services/payment/przelewy24-payment.service.ts

import axios from 'axios';
import crypto from 'crypto';
import { IOrderDocument } from '../../models/order.model';
import { PaymentError } from '../../utils/custom-errors.util';
import environment from '../../config/environment';

const P24_API_URL = environment.payment.przelewy24ApiUrl;
const P24_MERCHANT_ID = environment.payment.przelewy24MerchantId;
const P24_CRC = environment.payment.przelewy24Crc;
const P24_API_KEY = environment.payment.przelewy24ApiKey;

function generateP24Signature(sessionId: string, merchantId: string, amount: number, currency: string) {
  const dataToSign = `${sessionId}|${merchantId}|${amount}|${currency}|${P24_CRC}`;
  return crypto.createHash('md5').update(dataToSign).digest('hex');
}

export async function initializePrzelewy24Payment(order: IOrderDocument): Promise<PaymentInitializationResult> {
  try {
    const sessionId = order.id.toString();
    const amount = Math.round(order.totalAmount * 100); // Convert to cents
    const signature = generateP24Signature(sessionId, P24_MERCHANT_ID, amount, 'PLN');

    const response = await axios.post(`${P24_API_URL}/transaction/register`, {
      merchantId: P24_MERCHANT_ID,
      posId: P24_MERCHANT_ID,
      sessionId: sessionId,
      amount: amount,
      currency: 'PLN',
      description: `Order ${order._id}`,
      email: order.userEmail,
      country: 'PL',
      language: 'pl',
      urlReturn: `${environment.app.frontend}/payment/success`,
      urlStatus: `${environment.app.backend}/api/payments/callback/przelewy24`,
      sign: signature
    }, {
      headers: {
        'Authorization': `Basic ${Buffer.from(P24_MERCHANT_ID + ':' + P24_API_KEY).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      transactionId: response.data.data.token,
      paymentUrl: `${P24_API_URL}/trnRequest/${response.data.data.token}`
    };
  } catch (error) {
    throw new PaymentError('Failed to initialize Przelewy24 payment');
  }
}

export async function verifyPrzelewy24Payment(sessionId: string, orderId: string, amount: number, currency: string, signature: string): Promise<PaymentVerificationResult> {
  try {
    const expectedSignature = generateP24Signature(sessionId, P24_MERCHANT_ID, amount, currency);
    if (signature !== expectedSignature) {
      throw new PaymentError('Invalid signature');
    }

    const response = await axios.put(`${P24_API_URL}/transaction/verify`, {
      merchantId: P24_MERCHANT_ID,
      posId: P24_MERCHANT_ID,
      sessionId: sessionId,
      amount: amount,
      currency: currency,
      orderId: orderId,
      sign: signature
    }, {
      headers: {
        'Authorization': `Basic ${Buffer.from(P24_MERCHANT_ID + ':' + P24_API_KEY).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: response.data.data.status === 'success',
      orderId: orderId
    };
  } catch (error) {
    throw new PaymentError('Failed to verify Przelewy24 payment');
  }
}