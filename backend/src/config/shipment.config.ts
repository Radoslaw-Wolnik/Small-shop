import { getEnvValue } from './get-env-value';

export interface ShipmentConfig {
    defaultShippingProvider: string;
}

export const shipmentConfig: ShipmentConfig = {
    defaultShippingProvider: getEnvValue('DEFAULT_SHIPPING_PROVIDER', 'standard'),
};
