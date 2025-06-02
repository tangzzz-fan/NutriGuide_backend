import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SocialLoginDocument = SocialLoginModel & Document;

@Schema({
    collection: 'sociallogins',
    timestamps: true,
})
export class SocialLoginModel {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId: Types.ObjectId;

    @Prop({
        required: true,
        enum: ['wechat', 'apple', 'google', 'facebook'],
        index: true,
    })
    provider: 'wechat' | 'apple' | 'google' | 'facebook';

    @Prop({ required: true })
    providerId: string;

    @Prop({ required: false })
    providerEmail?: string;

    @Prop({ required: false })
    providerName?: string;

    @Prop({ required: false })
    providerAvatar?: string;

    @Prop({ required: false })
    accessToken?: string;

    @Prop({ required: false })
    refreshToken?: string;

    @Prop({ required: false })
    tokenExpiresAt?: Date;

    @Prop({ required: false })
    lastLoginAt?: Date;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: Object, required: false })
    metadata?: Record<string, any>;
}

export const SocialLoginSchema = SchemaFactory.createForClass(SocialLoginModel);

// Compound unique index for provider and providerId
SocialLoginSchema.index({ provider: 1, providerId: 1 }, { unique: true });

// Other indexes
SocialLoginSchema.index({ userId: 1, provider: 1 });
SocialLoginSchema.index({ isActive: 1, lastLoginAt: 1 }); 