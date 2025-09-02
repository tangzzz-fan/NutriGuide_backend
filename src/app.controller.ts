import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Application')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiOperation({ summary: 'Get application info' })
  @ApiResponse({ status: 200, description: 'Application info retrieved successfully' })
  getHello(): object {
    return this.appService.getAppInfo();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  healthCheck(): object {
    return this.appService.healthCheck();
  }

  @Get('api-info')
  @ApiOperation({
    summary: 'Get API information',
    description: 'Returns comprehensive API information including endpoints, authentication methods, usage examples, and environment details. Supports multiple output formats optimized for different development tools and command-line usage.'
  })
  @ApiQuery({
    name: 'format',
    required: false,
    description: 'Output format: json (default), yaml, markdown, curl (command examples), postman (collection)',
    enum: ['json', 'yaml', 'markdown', 'curl', 'postman'],
    example: 'json'
  })
  @ApiQuery({
    name: 'section',
    required: false,
    description: 'Specific section: all (default), endpoints, auth, examples, env (environment info)',
    enum: ['all', 'endpoints', 'auth', 'examples', 'env'],
    example: 'all'
  })
  @ApiResponse({
    status: 200,
    description: 'API information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'API information retrieved successfully' },
        data: {
          type: 'object',
          description: 'API information in requested format - structure varies by format and section'
        }
      }
    }
  })
  getApiInfo(
    @Query('format') format: 'json' | 'yaml' | 'markdown' | 'curl' | 'postman' = 'json',
    @Query('section') section: 'all' | 'endpoints' | 'auth' | 'examples' | 'env' = 'all'
  ): object {
    return this.appService.getApiInfo(format, section);
  }
}
