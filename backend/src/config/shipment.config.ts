// src/config/shipment.config.ts
import { getEnvValue } from './get-env-value';

export interface ShipmentConfig {
    dhlApiUrl: string;
    dhlApiKey: string;
    dhlAccountNumber: string;
    pocztaPolskaApiUrl: string;
    pocztaPolskaApiKey: string;
    inpostApiUrl: string;
    inpostApiKey: string;
    amazonApiUrl: string;
    amazonAccessKey: string;
    amazonSecretKey: string;
    amazonSellerId: string;
}
  
export const shipmentConfig: ShipmentConfig = {
    dhlApiUrl: getEnvValue('DHL_API_URL'),
    dhlApiKey: getEnvValue('DHL_API_KEY'),
    dhlAccountNumber: getEnvValue('DHL_ACCOUNT_NUMBER'),
    pocztaPolskaApiUrl: getEnvValue('POCZTA_POLSKA_API_URL'),
    pocztaPolskaApiKey: getEnvValue('POCZTA_POLSKA_API_KEY'),
    inpostApiUrl: getEnvValue('INPOST_API_URL'),
    inpostApiKey: getEnvValue('INPOST_API_KEY'),
    amazonApiUrl: getEnvValue('AMAZON_API_URL'),
    amazonAccessKey: getEnvValue('AMAZON_ACCESS_KEY'),
    amazonSecretKey: getEnvValue('AMAZON_SECRET_KEY'),
    amazonSellerId: getEnvValue('AMAZON_SELLER_ID'),
};