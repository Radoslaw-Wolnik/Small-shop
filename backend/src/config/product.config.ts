import { getEnvValue } from './get-env-value';

export interface ProductConfig {
    maxPictures: number;
}

export const productConfig: ProductConfig = {
    maxPictures: parseInt(getEnvValue('MAX_PRODUCT_PICTURES', '5'), 10),
};