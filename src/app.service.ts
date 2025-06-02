import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * Get application information
   * @returns Application info object
   */
  getAppInfo(): object {
    return {
      statusCode: 200,
      message: 'NutriGuide API is running successfully',
      data: {
        name: 'NutriGuide Backend API',
        version: '1.0.0',
        description: 'MVP Phase',
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Health check endpoint
   * @returns Health status object
   */
  healthCheck(): object {
    return {
      statusCode: 200,
      message: 'Service is healthy',
      data: {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    };
  }
}
