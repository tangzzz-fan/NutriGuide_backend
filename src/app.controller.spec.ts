import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      const config = {
        'app.name': 'NutriGuide',
        'app.version': '1.0.0',
        'app.environment': 'test',
        'PORT': 3000,
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getHello', () => {
    it('should return app info', () => {
      const expectedResult = {
        statusCode: 200,
        message: 'NutriGuide API is running successfully',
        data: expect.any(Object),
      };

      const result = appController.getHello();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('healthCheck', () => {
    it('should return health status', () => {
      const expectedResult = {
        statusCode: 200,
        message: 'Service is healthy',
        data: expect.any(Object),
      };

      const result = appController.healthCheck();
      expect(result).toEqual(expectedResult);
    });
  });
});
