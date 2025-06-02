import { registerAs } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export default registerAs('database', (): MongooseModuleOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isQA = process.env.NODE_ENV === 'qa';

  const baseConfig: MongooseModuleOptions = {
    uri: process.env.MONGODB_URI,
  };

  // Production specific configuration
  if (isProduction) {
    return {
      ...baseConfig,
    };
  }

  // QA specific configuration
  if (isQA) {
    return {
      ...baseConfig,
    };
  }

  // Development specific configuration
  return {
    ...baseConfig,
  };
});

/**
 * Get database configuration based on environment
 */
export const getDatabaseConfig = (): MongooseModuleOptions => {
  const env = process.env.NODE_ENV || 'development';

  const baseConfig: MongooseModuleOptions = {
    uri: process.env.MONGODB_URI,
  };

  switch (env) {
    case 'production':
      return {
        ...baseConfig,
      };

    case 'qa':
      return {
        ...baseConfig,
      };

    default: // development
      return {
        ...baseConfig,
      };
  }
};
