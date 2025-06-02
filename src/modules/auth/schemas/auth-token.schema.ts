import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuthTokenDocument = AuthTokenModel & Document;

@Schema({
    collection: 'authtokens',
    timestamps: true,
})
export class AuthTokenModel {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId: Types.ObjectId;

    @Prop({ required: true, unique: true, index: true })
    token: string;

    @Prop({
        required: true,
        enum: ['refresh', 'email-verification', 'password-reset'],
        index: true,
    })
    type: 'refresh' | 'email-verification' | 'password-reset';

    @Prop({ required: true, index: { expireAfterSeconds: 0 } })
    expiresAt: Date;

    @Prop({ default: false, index: true })
    isRevoked: boolean;

    @Prop({ required: false })
    userAgent?: string;

    @Prop({ required: false })
    ipAddress?: string;

    @Prop({ required: false })
    deviceId?: string;

    @Prop({ required: false })
    lastUsedAt?: Date;
}

export const AuthTokenSchema = SchemaFactory.createForClass(AuthTokenModel);

// Indexes
AuthTokenSchema.index({ userId: 1, type: 1 });
AuthTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
AuthTokenSchema.index({ isRevoked: 1, expiresAt: 1 }); 