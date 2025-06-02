import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard API Response DTO
 */
export class ResponseDto<T = any> {
  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Response message',
    example: 'Operation successful',
    required: false,
  })
  message?: string;

  @ApiProperty({
    description: 'Response data',
    required: false,
  })
  data?: T;

  constructor(statusCode: number, message?: string, data?: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

/**
 * Error Response DTO
 */
export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Validation failed',
  })
  message: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request',
    required: false,
  })
  error?: string;

  @ApiProperty({
    description: 'Detailed error information',
    required: false,
    type: [Object],
  })
  errors?: any[];

  @ApiProperty({
    description: 'Timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  timestamp: string;

  constructor(statusCode: number, message: string, error?: string, errors?: any[]) {
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
  }
}
