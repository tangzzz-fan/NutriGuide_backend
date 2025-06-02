import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @Expose()
  _id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
  })
  @Expose()
  username: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
  })
  @Expose()
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
  })
  @Expose()
  lastName: string;

  @ApiProperty({
    description: 'Full name',
    example: 'John Doe',
  })
  @Expose()
  fullName: string;

  @ApiProperty({
    description: 'Gender',
    enum: ['male', 'female', 'other'],
    required: false,
  })
  @Expose()
  gender?: string;

  @ApiProperty({
    description: 'Birth year',
    example: 1990,
    required: false,
  })
  @Expose()
  birthYear?: number;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
    required: false,
  })
  @Expose()
  phone?: string;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'Whether the email is verified',
    example: false,
  })
  @Expose()
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'Last login timestamp',
    example: '2023-01-01T00:00:00.000Z',
    required: false,
  })
  @Expose()
  lastLoginAt?: Date;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;

  // Exclude sensitive fields
  @Exclude()
  password: string;

  @Exclude()
  emailVerificationToken?: string;

  @Exclude()
  passwordResetToken?: string;

  @Exclude()
  passwordResetExpires?: Date;

  @Exclude()
  __v: number;
}
