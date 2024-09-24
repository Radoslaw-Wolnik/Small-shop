import { getEnvValue } from './get-env-value';

export interface PaymentConfig {
    defaultPaymentGateway: string;
    paymentWebhookSecret: string;
}

export const paymentConfig: PaymentConfig = {
    defaultPaymentGateway: getEnvValue('DEFAULT_PAYMENT_GATEWAY', 'stripe'),
    paymentWebhookSecret: getEnvValue('PAYMENT_WEBHOOK_SECRET'),
};