import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SmsVerificationDocument = SmsVerificationModel & Document;

@Schema({
    collection: 'smsverifications',
    timestamps: true,
})
export class SmsVerificationModel {
    @Prop({ required: true, index: true })
    phone: string;

    @Prop({ required: true })
    code: string;

    @Prop({
        required: true,
        enum: ['login', 'register', 'reset-password', 'phone-verification'],
        index: true,
    })
    type: 'login' | 'register' | 'reset-password' | 'phone-verification';

    @Prop({ required: true, index: { expireAfterSeconds: 0 } })
    expiresAt: Date;

    @Prop({ default: false })
    verified: boolean;

    @Prop({ default: 0 })
    attempts: number;

    @Prop({ default: 5 })
    maxAttempts: number;

    @Prop({ required: false })
    ipAddress?: string;

    @Prop({ required: false })
    userAgent?: string;

    @Prop({ required: false })
    deviceId?: string;

    @Prop({ required: false })
    verifiedAt?: Date;

    @Prop({ required: false })
    lastAttemptAt?: Date;

    // Timestamps (automatically added by Mongoose when timestamps: true)
    createdAt?: Date;
    updatedAt?: Date;
}

export const SmsVerificationSchema = SchemaFactory.createForClass(SmsVerificationModel);

// Indexes
SmsVerificationSchema.index({ phone: 1, type: 1 });
SmsVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SmsVerificationSchema.index({ verified: 1, createdAt: 1 }); 