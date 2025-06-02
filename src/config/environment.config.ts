import { registerAs } from '@nestjs/config';

export interface EnvironmentVariables {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  LOG_LEVEL: string;
  SWAGGER_TITLE: string;
  CORS_ORIGIN?: string;
}

export default registerAs(
  'env',
  (): EnvironmentVariables => ({
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT, 10) || 3000,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/nutriguide',
    JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    SWAGGER_TITLE: process.env.SWAGGER_TITLE || 'NutriGuide API',
    CORS_ORIGIN: process.env.CORS_ORIGIN,
  })
);

/**
 * Environment validation schema
 */
export const environmentSchema = {
  NODE_ENV: {
    required: true,
    enum: ['development', 'qa', 'production'],
  },
  PORT: {
    required: true,
    type: 'number',
  },
  MONGODB_URI: {
    required: true,
    type: 'string',
  },
  JWT_SECRET: {
    required: true,
    type: 'string',
    minLength: 10,
  },
  JWT_EXPIRES_IN: {
    required: true,
    type: 'string',
  },
};
