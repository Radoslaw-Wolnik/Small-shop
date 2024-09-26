// src/config/payment.config.ts

import { getEnvValue } from './get-env-value';

export interface PaymentConfig {
  stripeSecretKey: string;
  stripePublishableKey: string;
  paypalApiUrl: string;
  paypalClientId: string;
  paypalClientSecret: string;
  przelewy24ApiUrl: string;
  przelewy24MerchantId: string;
  przelewy24Crc: string;
  przelewy24ApiKey: string;
  payuApiUrl: string;
  payuPosId: string;
  payuMd5Key: string;
  payuOAuthClientId: string;
  payuOAuthClientSecret: string;
}

export const paymentConfig: PaymentConfig = {
  stripeSecretKey: getEnvValue('STRIPE_SECRET_KEY'),
  stripePublishableKey: getEnvValue('STRIPE_PUBLISHABLE_KEY'),
  paypalApiUrl: getEnvValue('PAYPAL_API_URL'),
  paypalClientId: getEnvValue('PAYPAL_CLIENT_ID'),
  paypalClientSecret: getEnvValue('PAYPAL_CLIENT_SECRET'),
  przelewy24ApiUrl: getEnvValue('PRZELEWY24_API_URL'),
  przelewy24MerchantId: getEnvValue('PRZELEWY24_MERCHANT_ID'),
  przelewy24Crc: getEnvValue('PRZELEWY24_CRC'),
  przelewy24ApiKey: getEnvValue('PRZELEWY24_API_KEY'),
  payuApiUrl: getEnvValue('PAYU_API_URL'),
  payuPosId: getEnvValue('PAYU_POS_ID'),
  payuMd5Key: getEnvValue('PAYU_MD5_KEY'),
  payuOAuthClientId: getEnvValue('PAYU_OAUTH_CLIENT_ID'),
  payuOAuthClientSecret: getEnvValue('PAYU_OAUTH_CLIENT_SECRET'),
};