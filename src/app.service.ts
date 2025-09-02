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
   * @param format Output format (json, yaml, markdown, curl, postman)
   * @param section Specific section to return
   * @returns API information in requested format
   */
  getApiInfo(format: 'json' | 'yaml' | 'markdown' | 'curl' | 'postman' = 'json', section: 'endpoints' | 'auth' | 'examples' | 'all' | 'env' = 'all'): object {
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
        register: {
          phoneSimple: `POST ${apiBaseUrl}/auth/register/phone`,
          traditional: `POST ${apiBaseUrl}/auth/register`
        },
        login: {
          email: `POST ${apiBaseUrl}/auth/login/email`,
          phone: `POST ${apiBaseUrl}/auth/login/phone`,
          sms: `POST ${apiBaseUrl}/auth/login/sms`,
          oneTap: `POST ${apiBaseUrl}/auth/login/one-tap`,
          social: `POST ${apiBaseUrl}/auth/login/social`
        },
        refresh: `POST ${apiBaseUrl}/auth/refresh`,
        logout: `POST ${apiBaseUrl}/auth/logout`,
        sms: {
          send: `POST ${apiBaseUrl}/auth/sms/send`,
          verify: `POST ${apiBaseUrl}/auth/sms/verify`
        }
      },
      users: {
        list: `GET ${apiBaseUrl}/users`,
        create: `POST ${apiBaseUrl}/users`,
        getById: `GET ${apiBaseUrl}/users/:id`,
        update: `PATCH ${apiBaseUrl}/users/:id`,
        delete: `DELETE ${apiBaseUrl}/users/:id`,
        restore: `POST ${apiBaseUrl}/users/:id/restore`,
        statistics: `GET ${apiBaseUrl}/users/statistics`,
        profile: {
          get: `GET ${apiBaseUrl}/users/profile`,
          create: `POST ${apiBaseUrl}/users/profile`,
          update: `PATCH ${apiBaseUrl}/users/profile`,
          delete: `DELETE ${apiBaseUrl}/users/profile`,
          status: `GET ${apiBaseUrl}/users/profile/status`
        },
        preferences: {
          get: `GET ${apiBaseUrl}/users/preferences`,
          create: `POST ${apiBaseUrl}/users/preferences`,
          update: `PATCH ${apiBaseUrl}/users/preferences`,
          delete: `DELETE ${apiBaseUrl}/users/preferences`
        }
      },
      foods: {
        list: `GET ${apiBaseUrl}/foods`,
        create: `POST ${apiBaseUrl}/foods`,
        getById: `GET ${apiBaseUrl}/foods/:id`,
        update: `PATCH ${apiBaseUrl}/foods/:id`,
        delete: `DELETE ${apiBaseUrl}/foods/:id`,
        search: `GET ${apiBaseUrl}/foods/search`,
        categories: `GET ${apiBaseUrl}/foods/categories`,
        barcode: `GET ${apiBaseUrl}/foods/barcode/:barcode`
      },
      foodLogs: {
        list: `GET ${apiBaseUrl}/food-logs`,
        create: `POST ${apiBaseUrl}/food-logs`,
        getById: `GET ${apiBaseUrl}/food-logs/:id`,
        update: `PATCH ${apiBaseUrl}/food-logs/:id`,
        delete: `DELETE ${apiBaseUrl}/food-logs/:id`,
        daily: `GET ${apiBaseUrl}/food-logs/daily/:date`
      },
      nutrition: {
        daily: `GET ${apiBaseUrl}/nutrition/daily/:date`,
        weekly: `GET ${apiBaseUrl}/nutrition/weekly/:startDate`,
        monthly: `GET ${apiBaseUrl}/nutrition/monthly/:year/:month`,
        trends: `GET ${apiBaseUrl}/nutrition/trends`,
        goals: `GET ${apiBaseUrl}/nutrition/goals-progress`
      },
      mealPlans: {
        list: `GET ${apiBaseUrl}/meal-plans`,
        create: `POST ${apiBaseUrl}/meal-plans`,
        getById: `GET ${apiBaseUrl}/meal-plans/:id`,
        update: `PATCH ${apiBaseUrl}/meal-plans/:id`,
        delete: `DELETE ${apiBaseUrl}/meal-plans/:id`
      },
      recipes: {
        list: `GET ${apiBaseUrl}/recipes`,
        create: `POST ${apiBaseUrl}/recipes`,
        getById: `GET ${apiBaseUrl}/recipes/:id`,
        update: `PATCH ${apiBaseUrl}/recipes/:id`,
        delete: `DELETE ${apiBaseUrl}/recipes/:id`
      },
      recommendations: {
        foods: `GET ${apiBaseUrl}/recommendations/foods`,
        mealPlans: `GET ${apiBaseUrl}/recommendations/meal-plans`,
        feedback: `POST ${apiBaseUrl}/recommendations/feedback`
      },
      shoppingLists: {
        list: `GET ${apiBaseUrl}/shopping-lists`,
        create: `POST ${apiBaseUrl}/shopping-lists`,
        getById: `GET ${apiBaseUrl}/shopping-lists/:id`,
        update: `PATCH ${apiBaseUrl}/shopping-lists/:id`,
        delete: `DELETE ${apiBaseUrl}/shopping-lists/:id`,
        generateFromPlan: `POST ${apiBaseUrl}/shopping-lists/generate/:planId`,
        statistics: `GET ${apiBaseUrl}/shopping-lists/statistics`,
        toggleItem: `PATCH ${apiBaseUrl}/shopping-lists/:id/items/:foodId/toggle`
      },
      ecommerce: {
        orders: {
          list: `GET ${apiBaseUrl}/ecommerce/orders`,
          create: `POST ${apiBaseUrl}/ecommerce/orders`,
          getById: `GET ${apiBaseUrl}/ecommerce/orders/:id`,
          updateStatus: `PATCH ${apiBaseUrl}/ecommerce/orders/:id/status`,
          cancel: `PATCH ${apiBaseUrl}/ecommerce/orders/:id/cancel`,
          statistics: `GET ${apiBaseUrl}/ecommerce/orders/statistics`
        },
        platforms: `GET ${apiBaseUrl}/ecommerce/platforms`,
        deliveryOptions: `POST ${apiBaseUrl}/ecommerce/platforms/:platformId/delivery-options`,
        webhooks: `POST ${apiBaseUrl}/ecommerce/webhooks/:platformId`
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
      },
      shoppingList: {
        curl: `curl -X POST ${apiBaseUrl}/shopping-lists/generate/507f1f77bcf86cd799439012 \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json"`,
        response: {
          statusCode: 201,
          message: 'Shopping list generated successfully',
          data: {
            id: '507f1f77bcf86cd799439013',
            userId: '507f1f77bcf86cd799439010',
            planId: '507f1f77bcf86cd799439012',
            items: [
              {
                foodId: '507f1f77bcf86cd799439014',
                name: '西兰花',
                totalQuantity: 500,
                unit: 'g',
                isPurchased: false,
                estimatedPrice: 8.5
              }
            ],
            status: 'pending',
            totalEstimatedCost: 30.5
          }
        }
      },
      ecommerceOrder: {
        curl: `curl -X POST ${apiBaseUrl}/ecommerce/orders \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "shoppingListId": "507f1f77bcf86cd799439013",
    "platformId": "mock",
    "deliveryAddress": {
      "province": "北京市",
      "city": "北京市",
      "district": "朝阳区",
      "address": "三里屯街道工体北路123号",
      "recipientName": "张三",
      "recipientPhone": "13812345678"
    },
    "deliveryTime": "asap"
  }'`,
        response: {
          statusCode: 201,
          message: '订单创建成功',
          data: {
            id: '507f1f77bcf86cd799439015',
            platformOrderId: 'MOCK_1725267600000_abc123xyz',
            status: 'pending',
            totalAmount: 51.00,
            paymentUrl: 'https://mock-payment.example.com/pay/MOCK_1725267600000_abc123xyz'
          }
        }
      }
    };

    // Build response based on section and format
    let data: any = {};

    // Add environment info section
    const envInfo = {
      current: envConfig.NODE_ENV,
      available: ['development', 'qa', 'production'],
      features: {
        development: {
          swagger: true,
          universalSmsCode: '123456',
          mongoExpress: `http://localhost:8081`,
          hotReload: true
        },
        qa: {
          swagger: true,
          universalSmsCode: null,
          mongoExpress: null,
          hotReload: false
        },
        production: {
          swagger: false,
          universalSmsCode: null,
          mongoExpress: null,
          hotReload: false
        }
      },
      ports: {
        development: { api: 3000, mongodb: 27017, mongoExpress: 8081 },
        qa: { api: 3000, mongodb: 27018 },
        production: { api: 3000, mongodb: 27019 }
      }
    };

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
      case 'env':
        data = { apiInfo, environment: envInfo };
        break;
      case 'all':
      default:
        data = { apiInfo, authentication: authInfo, endpoints, examples, environment: envInfo };
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
      case 'postman':
        return {
          statusCode: 200,
          message: 'API information retrieved successfully',
          data: this.formatAsPostman(data)
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
    curlCommands += `# 快速开始指南\n`;
    curlCommands += `# 1. 登录获取Token\n`;
    curlCommands += `curl -X POST ${data.apiInfo.baseUrl}/auth/login/email \\\n`;
    curlCommands += `  -H "Content-Type: application/json" \\\n`;
    curlCommands += `  -d '{\n`;
    curlCommands += `    "identifier": "admin@nutriguide.com",\n`;
    curlCommands += `    "password": "Password123!",\n`;
    curlCommands += `    "deviceId": "cli-tool"\n`;
    curlCommands += `  }'\n\n`;

    curlCommands += `# 2. 使用Token调用API（替换 YOUR_ACCESS_TOKEN）\n`;
    curlCommands += `curl -X GET ${data.apiInfo.baseUrl}/users/profile \\\n`;
    curlCommands += `  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\\n`;
    curlCommands += `  -H "Content-Type: application/json"\n\n`;

    curlCommands += `# 3. 手机号快速注册（开发环境万能验证码：123456）\n`;
    curlCommands += `curl -X POST ${data.apiInfo.baseUrl}/auth/register/phone \\\n`;
    curlCommands += `  -H "Content-Type: application/json" \\\n`;
    curlCommands += `  -d '{\n`;
    curlCommands += `    "phone": "13800138888",\n`;
    curlCommands += `    "smsCode": "123456"\n`;
    curlCommands += `  }'\n\n`;

    curlCommands += `# 4. 创建食物记录\n`;
    curlCommands += `curl -X POST ${data.apiInfo.baseUrl}/food-logs \\\n`;
    curlCommands += `  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\\n`;
    curlCommands += `  -H "Content-Type: application/json" \\\n`;
    curlCommands += `  -d '{\n`;
    curlCommands += `    "foodId": "FOOD_ID",\n`;
    curlCommands += `    "quantity": 100,\n`;
    curlCommands += `    "unit": "g",\n`;
    curlCommands += `    "mealType": "breakfast"\n`;
    curlCommands += `  }'\n\n`;

    curlCommands += `# 更多API请参考: ${data.apiInfo.docsUrl || data.apiInfo.baseUrl}\n`;

    return curlCommands;
  }

  private formatAsPostman(data: any): object {
    return {
      info: {
        name: data.apiInfo.name,
        description: data.apiInfo.description,
        version: data.apiInfo.version,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      auth: {
        type: 'bearer',
        bearer: {
          token: '{{accessToken}}'
        }
      },
      variable: [
        {
          key: 'baseUrl',
          value: data.apiInfo.baseUrl,
          type: 'string'
        },
        {
          key: 'accessToken',
          value: '',
          type: 'string'
        }
      ],
      item: [
        {
          name: 'Authentication',
          item: [
            {
              name: 'Login with Email',
              request: {
                method: 'POST',
                header: [{ key: 'Content-Type', value: 'application/json' }],
                url: '{{baseUrl}}/auth/login/email',
                body: {
                  mode: 'raw',
                  raw: JSON.stringify({
                    identifier: 'admin@nutriguide.com',
                    password: 'Password123!',
                    deviceId: 'postman'
                  }, null, 2)
                }
              }
            },
            {
              name: 'Phone Register',
              request: {
                method: 'POST',
                header: [{ key: 'Content-Type', value: 'application/json' }],
                url: '{{baseUrl}}/auth/register/phone',
                body: {
                  mode: 'raw',
                  raw: JSON.stringify({
                    phone: '13800138888',
                    smsCode: '123456'
                  }, null, 2)
                }
              }
            }
          ]
        },
        {
          name: 'User Profile',
          item: [
            {
              name: 'Get Profile',
              request: {
                method: 'GET',
                header: [{ key: 'Authorization', value: 'Bearer {{accessToken}}' }],
                url: '{{baseUrl}}/users/profile'
              }
            }
          ]
        },
        {
          name: 'Food Management',
          item: [
            {
              name: 'Search Foods',
              request: {
                method: 'GET',
                header: [{ key: 'Authorization', value: 'Bearer {{accessToken}}' }],
                url: {
                  raw: '{{baseUrl}}/foods/search?query=苹果&limit=10',
                  host: ['{{baseUrl}}'],
                  path: ['foods', 'search'],
                  query: [
                    { key: 'query', value: '苹果' },
                    { key: 'limit', value: '10' }
                  ]
                }
              }
            },
            {
              name: 'Create Food Log',
              request: {
                method: 'POST',
                header: [
                  { key: 'Authorization', value: 'Bearer {{accessToken}}' },
                  { key: 'Content-Type', value: 'application/json' }
                ],
                url: '{{baseUrl}}/food-logs',
                body: {
                  mode: 'raw',
                  raw: JSON.stringify({
                    foodId: 'FOOD_ID',
                    quantity: 100,
                    unit: 'g',
                    mealType: 'breakfast'
                  }, null, 2)
                }
              }
            }
          ]
        }
      ]
    };
  }
}
