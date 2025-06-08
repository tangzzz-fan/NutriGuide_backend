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
    description: 'Returns comprehensive API information including endpoints, authentication methods, and usage examples. Supports different output formats for command-line tools.'
  })
  @ApiQuery({
    name: 'format',
    required: false,
    description: 'Output format (json, yaml, markdown, curl)',
    enum: ['json', 'yaml', 'markdown', 'curl'],
    example: 'json'
  })
  @ApiQuery({
    name: 'section',
    required: false,
    description: 'Specific section to return (endpoints, auth, examples, all)',
    enum: ['endpoints', 'auth', 'examples', 'all'],
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
          description: 'API information in requested format'
        }
      }
    }
  })
  getApiInfo(
    @Query('format') format: 'json' | 'yaml' | 'markdown' | 'curl' = 'json',
    @Query('section') section: 'endpoints' | 'auth' | 'examples' | 'all' = 'all'
  ): object {
    return this.appService.getApiInfo(format, section);
  }
}
