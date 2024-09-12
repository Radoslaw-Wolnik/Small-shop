// src/config/environment.ts

import { databaseConfig, DatabaseConfig } from './database.config';
import { authConfig, AuthConfig } from './auth.config';
import { emailConfig, EmailConfig } from './email.config';
import { appConfig, AppConfig } from './app.config';

interface Enviorement {
  database: DatabaseConfig;
  auth: AuthConfig;
  email: EmailConfig;
  app: AppConfig;
}

export const environment: Enviorement = {
  database: databaseConfig,
  auth: authConfig,
  email: emailConfig,
  app: appConfig,
};

export default environment;