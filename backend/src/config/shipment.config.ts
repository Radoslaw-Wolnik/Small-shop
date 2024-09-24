import { getEnvValue } from './get-env-value';

export interface ShipmentConfig {
    defaultShippingProvider: string;
    amazonApiUrl: string;
    amazonSellerId: string;
    amazonAccessKey: string;
    amazonSecretKey: string;
}

export const shipmentConfig: ShipmentConfig = {
    defaultShippingProvider: getEnvValue('DEFAULT_SHIPPING_PROVIDER', 'standard'),
    amazonApiUrl: getEnvValue('AMAZON_API_URL'),
    amazonSellerId: getEnvValue('AMAZON_SELLER_ID'),
    amazonAccessKey: getEnvValue('AMAZON_ACCESS_KEY'),
    amazonSecretKey: getEnvValue('AMAZON_SECRET_KEY'),
};
