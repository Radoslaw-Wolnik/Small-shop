// src/services/payment/payu-payment.service.ts

import axios from 'axios';
import crypto from 'crypto';
import { IOrderDocument } from '../../models/order.model';
import { PaymentError } from '../../utils/custom-errors.util';
import environment from '../../config/environment';

const PAYU_API_URL = environment.payment.payuApiUrl;
const PAYU_POS_ID = environment.payment.payuPosId;
const PAYU_MD5_KEY = environment.payment.payuMd5Key;
const PAYU_OAUTH_CLIENT_ID = environment.payment.payuOAuthClientId;
const PAYU_OAUTH_CLIENT_SECRET = environment.payment.payuOAuthClientSecret;

async function getPayUAccessToken() {
  const response = await axios.post(`${PAYU_API_URL}/pl/standard/user/oauth/authorize`, {
    grant_type: 'client_credentials',
    client_id: PAYU_OAUTH_CLIENT_ID,
    client_secret: PAYU_OAUTH_CLIENT_SECRET
  });
  return response.data.access_token;
}

function generatePayUSignature(payload: string) {
  return crypto.createHash('md5').update(payload + PAYU_MD5_KEY).digest('hex');
}

export async function initializePayUPayment(order: IOrderDocument): Promise<string> {
  try {
    const accessToken = await getPayUAccessToken();
    const orderData = {
      notifyUrl: `${environment.app.backend}/api/payments/callback/payu`,
      customerIp: '127.0.0.1', // Replace with actual customer IP
      merchantPosId: PAYU_POS_ID,
      description: `Order ${order._id}`,
      currencyCode: 'PLN',
      totalAmount: Math.round(order.totalAmount * 100),
      buyer: {
        email: order.user.email,
        phone: order.user.phone,
        firstName: order.user.firstName,
        lastName: order.user.lastName,
        language: 'pl'
      },
      products: order.products.map(product => ({
        name: product.product.name,
        unitPrice: Math.round(product.price * 100),
        quantity: product.quantity
      }))
    };

    const response = await axios.post(`${PAYU_API_URL}/api/v2_1/orders`, orderData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.redirectUri;
  } catch (error) {
    throw new PaymentError('Failed to initialize PayU payment');
  }
}

export async function verifyPayUPayment(payload: any): Promise<boolean> {
  try {
    const { order, signature } = payload;
    const concatenatedOrder = `${order.orderId}|${order.extOrderId}|${order.orderCreateDate}|${order.notifyType}|${order.merchantPosId}|${order.description}|${order.amount}|${order.currencyCode}|${order.status}`;
    const expectedSignature = generatePayUSignature(concatenatedOrder);

    if (signature !== expectedSignature) {
      throw new PaymentError('Invalid signature');
    }

    return order.status === 'COMPLETED';
  } catch (error) {
    throw new PaymentError('Failed to verify PayU payment');
  }
}