// src/config/email.config.ts
import { getEnvValue } from './get-env-value';
import templateManager from '../utils/email-templates.util';

export interface EmailConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
    templateManager: typeof templateManager;
}

export const emailConfig: EmailConfig = {
    host: getEnvValue('EMAIL_HOST'),
    port: parseInt(getEnvValue('EMAIL_PORT', '587'), 10),
    user: getEnvValue('EMAIL_USER'),
    password: getEnvValue('EMAIL_PASSWORD'),
    from: getEnvValue('EMAIL_FROM'),
    templateManager: templateManager,
}