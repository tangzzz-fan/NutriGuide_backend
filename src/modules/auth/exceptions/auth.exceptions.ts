import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';

/**
 * Authentication specific exceptions with detailed error codes
 */

export class UserNotFoundException extends UnauthorizedException {
  constructor(identifier?: string) {
    super({
      message: 'User not found',
      error: 'USER_NOT_FOUND',
      details: identifier ? `No user found with identifier: ${identifier}` : 'User does not exist',
      code: 'AUTH_001'
    });
  }
}

export class InvalidPasswordException extends UnauthorizedException {
  constructor() {
    super({
      message: 'Invalid password',
      error: 'INVALID_PASSWORD',
      details: 'The provided password is incorrect',
      code: 'AUTH_002'
    });
  }
}

export class AccountDeactivatedException extends UnauthorizedException {
  constructor() {
    super({
      message: 'Account is deactivated',
      error: 'ACCOUNT_DEACTIVATED',
      details: 'This account has been deactivated. Please contact support.',
      code: 'AUTH_003'
    });
  }
}

export class EmailNotVerifiedException extends UnauthorizedException {
  constructor() {
    super({
      message: 'Email not verified',
      error: 'EMAIL_NOT_VERIFIED',
      details: 'Please verify your email address before logging in',
      code: 'AUTH_004'
    });
  }
}

export class InvalidSmsCodeException extends UnauthorizedException {
  constructor() {
    super({
      message: 'Invalid or expired SMS code',
      error: 'INVALID_SMS_CODE',
      details: 'The SMS verification code is invalid or has expired',
      code: 'AUTH_005'
    });
  }
}

export class SmsRateLimitException extends BadRequestException {
  constructor(waitTimeSeconds: number) {
    super({
      message: 'SMS rate limit exceeded',
      error: 'SMS_RATE_LIMIT',
      details: `Please wait ${waitTimeSeconds} seconds before requesting a new SMS code`,
      code: 'AUTH_006',
      waitTime: waitTimeSeconds
    });
  }
}

export class EmailAlreadyExistsException extends ConflictException {
  constructor(email: string) {
    super({
      message: 'Email already exists',
      error: 'EMAIL_ALREADY_EXISTS',
      details: `An account with email ${email} already exists`,
      code: 'AUTH_007'
    });
  }
}

export class UsernameAlreadyExistsException extends ConflictException {
  constructor(username: string) {
    super({
      message: 'Username already exists',
      error: 'USERNAME_ALREADY_EXISTS',
      details: `The username ${username} is already taken`,
      code: 'AUTH_008'
    });
  }
}

export class PhoneAlreadyExistsException extends ConflictException {
  constructor(phone: string) {
    super({
      message: 'Phone number already exists',
      error: 'PHONE_ALREADY_EXISTS',
      details: `An account with phone number ${phone} already exists`,
      code: 'AUTH_009'
    });
  }
}

export class InvalidRefreshTokenException extends UnauthorizedException {
  constructor() {
    super({
      message: 'Invalid or expired refresh token',
      error: 'INVALID_REFRESH_TOKEN',
      details: 'The refresh token is invalid, expired, or has been revoked',
      code: 'AUTH_010'
    });
  }
}

export class InvalidSocialTokenException extends UnauthorizedException {
  constructor(provider: string) {
    super({
      message: 'Invalid social login token',
      error: 'INVALID_SOCIAL_TOKEN',
      details: `The ${provider} login token is invalid or expired`,
      code: 'AUTH_011'
    });
  }
}

export class InvalidOneTapTokenException extends UnauthorizedException {
  constructor() {
    super({
      message: 'Invalid one-tap token',
      error: 'INVALID_ONE_TAP_TOKEN',
      details: 'The one-tap authentication token is invalid or expired',
      code: 'AUTH_012'
    });
  }
}

/**
 * Authentication error codes reference
 */
export const AUTH_ERROR_CODES = {
  USER_NOT_FOUND: 'AUTH_001',
  INVALID_PASSWORD: 'AUTH_002',
  ACCOUNT_DEACTIVATED: 'AUTH_003',
  EMAIL_NOT_VERIFIED: 'AUTH_004',
  INVALID_SMS_CODE: 'AUTH_005',
  SMS_RATE_LIMIT: 'AUTH_006',
  EMAIL_ALREADY_EXISTS: 'AUTH_007',
  USERNAME_ALREADY_EXISTS: 'AUTH_008',
  PHONE_ALREADY_EXISTS: 'AUTH_009',
  INVALID_REFRESH_TOKEN: 'AUTH_010',
  INVALID_SOCIAL_TOKEN: 'AUTH_011',
  INVALID_ONE_TAP_TOKEN: 'AUTH_012',
} as const;

/**
 * Helper function to get user-friendly error messages
 */
export function getAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    [AUTH_ERROR_CODES.USER_NOT_FOUND]: '用户不存在，请检查邮箱/用户名是否正确',
    [AUTH_ERROR_CODES.INVALID_PASSWORD]: '密码错误，请重新输入',
    [AUTH_ERROR_CODES.ACCOUNT_DEACTIVATED]: '账户已被停用，请联系客服',
    [AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED]: '邮箱未验证，请先验证邮箱',
    [AUTH_ERROR_CODES.INVALID_SMS_CODE]: '验证码无效或已过期，请重新获取',
    [AUTH_ERROR_CODES.SMS_RATE_LIMIT]: '获取验证码过于频繁，请稍后再试',
    [AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS]: '邮箱已被注册，请使用其他邮箱或直接登录',
    [AUTH_ERROR_CODES.USERNAME_ALREADY_EXISTS]: '用户名已被占用，请选择其他用户名',
    [AUTH_ERROR_CODES.PHONE_ALREADY_EXISTS]: '手机号已被注册，请使用其他手机号或直接登录',
    [AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN]: '登录已过期，请重新登录',
    [AUTH_ERROR_CODES.INVALID_SOCIAL_TOKEN]: '第三方登录失败，请重试',
    [AUTH_ERROR_CODES.INVALID_ONE_TAP_TOKEN]: '一键登录失败，请重试',
  };

  return messages[code] || '认证失败，请重试';
}
