import { Document } from 'mongoose';

export interface IUser {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    birthDate?: Date;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    height?: number; // cm
    weight?: number; // kg
    activityLevel?: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extra-active';

    // Account status
    isActive: boolean;
    isEmailVerified: boolean;

    // Security
    emailVerificationToken?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;

    // Tracking
    lastLoginAt?: Date;
    loginCount: number;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
    readonly fullName: string;
}

export interface IUserStatistics {
    total: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
}

export interface ICreateUser {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    birthDate?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    height?: number;
    weight?: number;
    activityLevel?: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extra-active';
}

export interface IUpdateUser {
    firstName?: string;
    lastName?: string;
    phone?: string;
    birthDate?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    height?: number;
    weight?: number;
    activityLevel?: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extra-active';
}

export interface IUserResponse {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phone?: string;
    birthDate?: Date;
    gender?: string;
    height?: number;
    weight?: number;
    activityLevel?: string;
    isActive: boolean;
    isEmailVerified: boolean;
    lastLoginAt?: Date;
    loginCount: number;
    createdAt: Date;
    updatedAt: Date;
} 