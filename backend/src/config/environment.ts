// src/config/environment.ts
import dotenv from 'dotenv';

dotenv.config();

interface Environment {
  DB_HOST: string;
  DB_NAME: string;
  DB_USER: string;
  DB_PASS: string;
  JWT_SECRET: string;
  PORT: number;
  PORT_HTTP: number;
  NODE_ENV: string;
  FRONTEND: string;
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  EMAIL_FROM: string;
  AUDIO_STORAGE_PATH: string;
  MAX_AUDIO_FILE_SIZE: number;
}

const env: Environment = {
  DB_HOST: process.env.DB_HOST || 'mongo:27017',
  DB_NAME: process.env.DB_NAME || '',
  DB_USER: process.env.DB_USER || '',
  DB_PASS: process.env.DB_PASS || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  PORT: parseInt(process.env.PORT || '5443', 10), //https
  PORT_HTTP: parseInt(process.env.PORT_HTTP || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND: process.env.FRONTEND || 'https://localhost:5173',
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
  EMAIL_USER: process.env.EMAIL_USER || '795ccf001@smtp-brevo.com',
  EMAIL_PASS: process.env.EMAIL_PASS || 'HPtac1DbV8wvsWZk',
  EMAIL_FROM: process.env.EMAIL_FROM || 'radoslaw.m.wolnik@gmail.com', // changed to radoslaw.m.wolnik@7953615.brevosend.com
  AUDIO_STORAGE_PATH: process.env.AUDIO_STORAGE_PATH || './audio_samples', // there is no ./audio sample i think - all in uploads -------- delete
  MAX_AUDIO_FILE_SIZE: parseInt(process.env.MAX_AUDIO_FILE_SIZE || '5242880', 10), // 5MB
};

export default env;

