// src/services/payment/paypal-payment.service.ts

import axios from 'axios';
import { IOrderDocument } from '../../models/order.model';
import User from '../../models/user.model';
import { PaymentError } from '../../utils/custom-errors.util';
import environment from '../../config/environment';

const PAYPAL_API_URL = environment.payment.paypalApiUrl;
const PAYPAL_CLIENT_ID = environment.payment.paypalClientId;
const PAYPAL_CLIENT_SECRET = environment.payment.paypalClientSecret;

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await axios.post(`${PAYPAL_API_URL}/v1/oauth2/token`, 'grant_type=client_credentials', {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return response.data.access_token;
}

export async function initializePayPalPayment(order: IOrderDocument): Promise<PaymentInitializationResult> {
  try {
    const accessToken = await getPayPalAccessToken();
    // Fetch user data


    const response = await axios.post(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'PLN',
          value: order.totalAmount.toFixed(2)
        },
        description: `Order ${order.id}`
      }],
      payer: {
        email_address: order.userEmail
      }
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const approvalUrl = response.data.links.find((link: any) => link.rel === 'approve').href;
    return {
      success: true,
      transactionId: response.data.id,
      paymentUrl: approvalUrl
    };
  } catch (error) {
    throw new PaymentError('Failed to initialize PayPal payment');
  }
}

export async function verifyPayPalPayment(orderId: string): Promise<PaymentVerificationResult> {
  try {
    const accessToken = await getPayPalAccessToken();
    const response = await axios.post(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {}, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: response.data.status === 'COMPLETED',
      orderId: response.data.purchase_units[0].reference_id
    };
  } catch (error) {
    throw new PaymentError('Failed to verify PayPal payment');
  }
}