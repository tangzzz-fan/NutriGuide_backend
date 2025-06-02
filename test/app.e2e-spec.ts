import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('statusCode', 200);
        expect(res.body).toHaveProperty('message', 'NutriGuide API is running successfully');
        expect(res.body).toHaveProperty('data');
      });
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('statusCode', 200);
        expect(res.body).toHaveProperty('message', 'Service is healthy');
        expect(res.body).toHaveProperty('data');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
