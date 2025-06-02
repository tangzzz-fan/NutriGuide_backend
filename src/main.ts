import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

/**
 * Bootstrap the NestJS application
 */
async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Get configuration service
    const configService = app.get(ConfigService);
    const envConfig = configService.get('env');

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        })
    );

    // Enable CORS with environment-specific configuration
    const corsOrigin = envConfig.CORS_ORIGIN;
    app.enableCors({
        origin: corsOrigin ? corsOrigin.split(',') : true,
        credentials: true,
    });

    // API prefix (exclude AppController routes)
    app.setGlobalPrefix('api/v1', {
        exclude: [
            { path: '', method: RequestMethod.GET },
            { path: 'health', method: RequestMethod.GET },
        ],
    });

    // Swagger configuration (disable in production)
    if (envConfig.NODE_ENV !== 'production') {
        const config = new DocumentBuilder()
            .setTitle(envConfig.SWAGGER_TITLE || 'NutriGuide API')
            .setDescription(process.env.SWAGGER_DESCRIPTION || 'NutriGuide Backend API Documentation')
            .setVersion(process.env.SWAGGER_VERSION || '1.0')
            .addBearerAuth()
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/docs', app, document);
    }

    const port = envConfig.PORT || 3000;
    await app.listen(port);

    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`🌍 Environment: ${envConfig.NODE_ENV}`);

    if (envConfig.NODE_ENV !== 'production') {
        console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
    }
}

bootstrap();
