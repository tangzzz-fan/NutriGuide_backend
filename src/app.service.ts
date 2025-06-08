import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) { }
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

  /**
   * Get comprehensive API information
   * @param format Output format (json, yaml, markdown, curl)
   * @param section Specific section to return
   * @returns API information in requested format
   */
  getApiInfo(format: 'json' | 'yaml' | 'markdown' | 'curl' = 'json', section: 'endpoints' | 'auth' | 'examples' | 'all' = 'all'): object {
    const envConfig = this.configService.get('env');
    const baseUrl = `http://localhost:${envConfig.PORT || 3000}`;
    const apiBaseUrl = `${baseUrl}/api/v1`;

    const apiInfo = {
      name: 'NutriGuide Backend API',
      version: '1.0.0',
      description: 'MVP Phase - Intelligent Nutrition Guidance Platform',
      baseUrl: apiBaseUrl,
      docsUrl: envConfig.NODE_ENV !== 'production' ? `${baseUrl}/api/docs` : null,
      timestamp: new Date().toISOString(),
    };

    const authInfo = {
      type: 'JWT Bearer Token',
      loginMethods: [
        'Email/Username + Password',
        'Phone + Password',
        'Phone + SMS Code',
        'Phone One-Tap (Mobile SDK)',
        'Social Login (WeChat, Apple, etc.)'
      ],
      defaultUsers: [
        {
          role: 'Admin',
          email: 'admin@nutriguide.com',
          username: 'admin',
          password: 'Password123!',
          description: 'Default administrator account'
        },
        {
          role: 'Test User',
          email: 'john.doe@example.com',
          username: 'johndoe',
          password: 'Password123!',
          description: 'Test user account'
        }
      ],
      tokenExpiry: envConfig.JWT_EXPIRES_IN || '7d',
      developmentFeatures: envConfig.NODE_ENV === 'development' ? {
        universalSmsCode: '123456',
        description: 'In development environment, you can use 123456 as a universal SMS verification code for all scenarios to save SMS costs'
      } : null
    };

    const endpoints = {
      authentication: {
        login: {
          email: `POST ${apiBaseUrl}/auth/login/email`,
          phone: `POST ${apiBaseUrl}/auth/login/phone`,
          sms: `POST ${apiBaseUrl}/auth/login/sms`,
          oneTap: `POST ${apiBaseUrl}/auth/login/one-tap`,
          social: `POST ${apiBaseUrl}/auth/login/social`
        },
        register: `POST ${apiBaseUrl}/auth/register`,
        refresh: `POST ${apiBaseUrl}/auth/refresh`,
        logout: `POST ${apiBaseUrl}/auth/logout`,
        sms: {
          send: `POST ${apiBaseUrl}/auth/sms/send`,
          verify: `POST ${apiBaseUrl}/auth/sms/verify`
        }
      },
      users: {
        list: `GET ${apiBaseUrl}/users`,
        profile: `GET ${apiBaseUrl}/users/profile`,
        updateProfile: `PUT ${apiBaseUrl}/users/profile`,
        preferences: `GET ${apiBaseUrl}/users/preferences`,
        updatePreferences: `PUT ${apiBaseUrl}/users/preferences`
      },
      foods: {
        list: `GET ${apiBaseUrl}/foods`,
        create: `POST ${apiBaseUrl}/foods`,
        getById: `GET ${apiBaseUrl}/foods/:id`,
        update: `PUT ${apiBaseUrl}/foods/:id`,
        delete: `DELETE ${apiBaseUrl}/foods/:id`,
        search: `GET ${apiBaseUrl}/foods/search`,
        categories: `GET ${apiBaseUrl}/foods/categories`,
        barcode: `GET ${apiBaseUrl}/foods/barcode/:barcode`
      },
      system: {
        health: `GET ${baseUrl}/health`,
        info: `GET ${baseUrl}`,
        apiInfo: `GET ${baseUrl}/api-info`
      }
    };

    const examples = {
      login: {
        curl: `curl -X POST ${apiBaseUrl}/auth/login/email \\
  -H "Content-Type: application/json" \\
  -d '{
    "identifier": "admin@nutriguide.com",
    "password": "Password123!",
    "deviceId": "web-browser",
    "rememberMe": false
  }'`,
        response: {
          statusCode: 200,
          message: 'Login successful',
          data: {
            user: { id: '...', email: 'admin@nutriguide.com', username: 'admin' },
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'refresh-token-abc123def456',
            tokenType: 'Bearer',
            expiresIn: 604800
          }
        }
      },
      authenticatedRequest: {
        curl: `curl -X GET ${apiBaseUrl}/users/profile \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json"`,
        note: 'Replace YOUR_ACCESS_TOKEN with the token received from login'
      },
      register: {
        curl: `curl -X POST ${apiBaseUrl}/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "newuser@example.com",
    "username": "newuser",
    "password": "securePassword123",
    "firstName": "New",
    "lastName": "User",
    "gender": "other",
    "birthYear": 1990,
    "deviceId": "web-browser",
    "rememberMe": false
  }'`
      }
    };

    // Build response based on section and format
    let data: any = {};

    switch (section) {
      case 'endpoints':
        data = { apiInfo, endpoints };
        break;
      case 'auth':
        data = { apiInfo, authentication: authInfo };
        break;
      case 'examples':
        data = { apiInfo, examples };
        break;
      case 'all':
      default:
        data = { apiInfo, authentication: authInfo, endpoints, examples };
        break;
    }

    // Format the response
    switch (format) {
      case 'yaml':
        return {
          statusCode: 200,
          message: 'API information retrieved successfully',
          data: this.formatAsYaml(data)
        };
      case 'markdown':
        return {
          statusCode: 200,
          message: 'API information retrieved successfully',
          data: this.formatAsMarkdown(data)
        };
      case 'curl':
        return {
          statusCode: 200,
          message: 'API information retrieved successfully',
          data: this.formatAsCurl(data)
        };
      case 'json':
      default:
        return {
          statusCode: 200,
          message: 'API information retrieved successfully',
          data
        };
    }
  }

  private formatAsYaml(data: any): string {
    // Simple YAML formatting - in production, use a proper YAML library
    return JSON.stringify(data, null, 2)
      .replace(/"/g, '')
      .replace(/,/g, '')
      .replace(/\{/g, '')
      .replace(/\}/g, '')
      .replace(/\[/g, '- ')
      .replace(/\]/g, '');
  }

  private formatAsMarkdown(data: any): string {
    let markdown = `# ${data.apiInfo.name}\n\n`;
    markdown += `**Version:** ${data.apiInfo.version}\n`;
    markdown += `**Description:** ${data.apiInfo.description}\n`;
    markdown += `**Base URL:** ${data.apiInfo.baseUrl}\n\n`;

    if (data.authentication) {
      markdown += `## Authentication\n\n`;
      markdown += `**Type:** ${data.authentication.type}\n`;
      markdown += `**Token Expiry:** ${data.authentication.tokenExpiry}\n\n`;

      markdown += `### Default Test Users\n\n`;
      data.authentication.defaultUsers.forEach((user: any) => {
        markdown += `- **${user.role}**\n`;
        markdown += `  - Email: \`${user.email}\`\n`;
        markdown += `  - Username: \`${user.username}\`\n`;
        markdown += `  - Password: \`${user.password}\`\n\n`;
      });
    }

    if (data.endpoints) {
      markdown += `## API Endpoints\n\n`;
      Object.entries(data.endpoints).forEach(([category, endpoints]: [string, any]) => {
        markdown += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
        this.addEndpointsToMarkdown(endpoints, markdown);
      });
    }

    return markdown;
  }

  private addEndpointsToMarkdown(endpoints: any, markdown: string): string {
    Object.entries(endpoints).forEach(([key, value]: [string, any]) => {
      if (typeof value === 'string') {
        markdown += `- **${key}:** \`${value}\`\n`;
      } else if (typeof value === 'object') {
        markdown += `- **${key}:**\n`;
        Object.entries(value).forEach(([subKey, subValue]: [string, any]) => {
          markdown += `  - ${subKey}: \`${subValue}\`\n`;
        });
      }
    });
    markdown += '\n';
    return markdown;
  }

  private formatAsCurl(data: any): string {
    let curlCommands = `# ${data.apiInfo.name} - cURL Examples\n\n`;

    if (data.examples) {
      Object.entries(data.examples).forEach(([key, example]: [string, any]) => {
        curlCommands += `# ${key.charAt(0).toUpperCase() + key.slice(1)}\n`;
        if (example.curl) {
          curlCommands += `${example.curl}\n\n`;
        }
        if (example.note) {
          curlCommands += `# Note: ${example.note}\n\n`;
        }
      });
    }

    return curlCommands;
  }
}
