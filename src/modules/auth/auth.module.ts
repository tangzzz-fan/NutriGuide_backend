import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { UserModule } from '../user/user.module';

import { AuthTokenModel, AuthTokenSchema } from './schemas/auth-token.schema';
import { SmsVerificationModel, SmsVerificationSchema } from './schemas/sms-verification.schema';
import { SocialLoginModel, SocialLoginSchema } from './schemas/social-login.schema';

@Module({
    imports: [
        ConfigModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'default-secret-key',
                signOptions: {
                    expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1h',
                },
            }),
            inject: [ConfigService],
        }),
        MongooseModule.forFeature([
            { name: 'AuthTokenModel', schema: AuthTokenSchema },
            { name: 'SmsVerificationModel', schema: SmsVerificationSchema },
            { name: 'SocialLoginModel', schema: SocialLoginSchema },
        ]),
        UserModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, JwtAuthGuard],
    exports: [AuthService, JwtAuthGuard, JwtStrategy],
})
export class AuthModule { } 