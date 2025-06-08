import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  collection: 'users',
})
export class User {
  @Prop({
    required: false,
    unique: true,
    lowercase: true,
    trim: true,
    sparse: true, // Allow multiple null values for unique index
  })
  email?: string;

  @Prop({
    required: false,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    sparse: true, // Allow multiple null values for unique index
  })
  username?: string;

  @Prop({
    required: false,
    minlength: 6,
  })
  password?: string;

  @Prop({
    required: false,
    trim: true,
    maxlength: 50,
  })
  firstName?: string;

  @Prop({
    required: false,
    trim: true,
    maxlength: 50,
  })
  lastName?: string;

  @Prop({
    enum: ['male', 'female', 'other'],
    required: false,
  })
  gender?: string;

  @Prop({
    required: false,
    min: 1900,
    max: new Date().getFullYear(),
  })
  birthYear?: number;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    maxlength: 20,
  })
  phone: string;

  @Prop({
    default: true,
  })
  isActive: boolean;

  @Prop({
    default: false,
  })
  isEmailVerified: boolean;

  @Prop({
    required: false,
  })
  emailVerificationToken?: string;

  @Prop({
    required: false,
  })
  passwordResetToken?: string;

  @Prop({
    required: false,
  })
  passwordResetExpires?: Date;

  @Prop({
    required: false,
  })
  lastLoginAt?: Date;

  @Prop({
    default: Date.now,
  })
  createdAt: Date;

  @Prop({
    default: Date.now,
  })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ phone: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ username: 1 }, { unique: true, sparse: true });
UserSchema.index({ createdAt: 1 });
UserSchema.index({ isActive: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function (this: UserDocument) {
  const firstName = this.firstName || '';
  const lastName = this.lastName || '';
  return `${firstName} ${lastName}`.trim() || 'User';
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.emailVerificationToken;
    delete ret.passwordResetToken;
    delete ret.__v;
    return ret;
  },
});
