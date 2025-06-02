import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { JwtPayload } from '../interfaces/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret-key',
        });
    }

    async validate(payload: JwtPayload): Promise<any> {
        const { sub: userId } = payload;

        // Validate user exists and is active
        const user = await this.userService.findById(userId);
        if (!user || !user.isActive) {
            throw new UnauthorizedException('User not found or inactive');
        }

        return {
            sub: userId,
            email: payload.email,
            username: payload.username,
            phone: payload.phone,
        };
    }
} 