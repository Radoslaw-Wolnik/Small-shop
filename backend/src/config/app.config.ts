import { getEnvValue } from './get-env-value';

export interface AppConfig {
    port: number;
    nodeEnv: 'development' | 'production';
    frontend: string;
    rotationInProgress: boolean;
}

export const appConfig: AppConfig = {
    port: parseInt(getEnvValue('PORT', '5000'), 10),
    nodeEnv: getEnvValue('NODE_ENV', 'development') as 'development' | 'production',
    frontend: getEnvValue('FRONTEND', 'https://localhost:5173'),
    rotationInProgress: getEnvValue('ROTATION_IN_PROGRESS', 'false') === 'true',
}
