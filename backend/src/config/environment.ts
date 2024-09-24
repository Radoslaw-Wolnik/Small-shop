// src/config/environment.ts

import { databaseConfig, DatabaseConfig } from './database.config';
import { authConfig, AuthConfig } from './auth.config';
import { emailConfig, EmailConfig } from './email.config';
import { appConfig, AppConfig } from './app.config';
import { productConfig, ProductConfig } from './product.config';
import { shipmentConfig, ShipmentConfig } from './shipment.config';
import { paymentConfig, PaymentConfig } from './payment.config';

interface Enviorement {
  database: DatabaseConfig;
  auth: AuthConfig;
  email: EmailConfig;
  app: AppConfig;
  product: ProductConfig;
  shipment: ShipmentConfig;
  payment: PaymentConfig
}

export const environment: Enviorement = {
  database: databaseConfig,
  auth: authConfig,
  email: emailConfig,
  app: appConfig,
  product: productConfig,
  shipment: shipmentConfig,
  payment: paymentConfig
};

export default environment;