import { UserDocument } from '../../user/schemas/user.schema';

/**
 * JWT Token payload interface
 */
export interface JwtPayload {
    sub: string; // User ID
    email?: string;
    username?: string;
    phone?: string;
    iat?: number;
    exp?: number;
}

/**
 * Authentication result interface
 */
export interface AuthResult {
    user: UserDocument;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

/**
 * Login response interface
 */
export interface LoginResponse {
    user: {
        id: string;
        email?: string;
        username: string;
        firstName: string;
        lastName: string;
        phone?: string;
        isEmailVerified: boolean;
        isActive: boolean;
    };
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: 'Bearer';
}

/**
 * SMS verification code interface
 */
export interface SmsVerification {
    phone: string;
    code: string;
    type: 'login' | 'register' | 'reset-password';
    expiresAt: Date;
    verified: boolean;
    attempts: number;
    maxAttempts: number;
    createdAt: Date;
}

/**
 * Auth token interface for refresh tokens and other auth tokens
 */
export interface AuthToken {
    userId: string;
    token: string;
    type: 'refresh' | 'email-verification' | 'password-reset';
    expiresAt: Date;
    isRevoked: boolean;
    createdAt: Date;
    updatedAt: Date;
    userAgent?: string;
    ipAddress?: string;
}

/**
 * Social login provider types
 */
export type SocialProvider = 'wechat' | 'apple' | 'google' | 'facebook';

/**
 * Social login interface
 */
export interface SocialLogin {
    userId: string;
    provider: SocialProvider;
    providerId: string;
    providerEmail?: string;
    providerName?: string;
    providerAvatar?: string;
    accessToken?: string;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Social login result from provider
 */
export interface SocialLoginResult {
    provider: SocialProvider;
    providerId: string;
    email?: string;
    name?: string;
    avatar?: string;
    accessToken?: string;
    refreshToken?: string;
}

/**
 * Login method types
 */
export type LoginMethod = 'email' | 'username' | 'phone' | 'sms-code' | 'one-tap-phone' | 'social';

/**
 * Login attempt tracking
 */
export interface LoginAttempt {
    identifier: string; // email, username, or phone
    method: LoginMethod;
    success: boolean;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
    failureReason?: string;
}

/**
 * Password validation rules
 */
export interface PasswordValidation {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge?: number; // days
}

/**
 * Security settings interface
 */
export interface SecuritySettings {
    maxLoginAttempts: number;
    lockoutDuration: number; // minutes
    passwordValidation: PasswordValidation;
    sessionTimeout: number; // minutes
    enableTwoFactor: boolean;
    enableSmsLogin: boolean;
    enableSocialLogin: boolean;
    allowedSocialProviders: SocialProvider[];
} 