import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
    PaginationQueryDto,
    PaginationMetaDto,
    PaginatedResponseDto,
} from '../../common/dto/pagination.dto';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    /**
     * Create a new user
     * @param createUserDto - User creation data
     * @returns Created user document
     */
    async create(createUserDto: CreateUserDto): Promise<UserDocument> {
        // Check if email already exists
        const existingUserByEmail = await this.userModel.findOne({
            email: createUserDto.email,
        });
        if (existingUserByEmail) {
            throw new ConflictException('Email already registered');
        }

        // Check if username already exists
        const existingUserByUsername = await this.userModel.findOne({
            username: createUserDto.username,
        });
        if (existingUserByUsername) {
            throw new ConflictException('Username already taken');
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

        // Create user
        const user = new this.userModel({
            ...createUserDto,
            password: hashedPassword,
        });

        return user.save();
    }

    /**
     * Find all users with pagination
     * @param paginationQuery - Pagination and sorting parameters
     * @returns Paginated users list
     */
    async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedResponseDto<UserDocument>> {
        const { page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = paginationQuery;

        const skip = (page - 1) * limit;
        const sortOrder: SortOrder = order === 'desc' ? -1 : 1;
        const sortOptions: { [key: string]: SortOrder } = { [sortBy]: sortOrder };

        // Execute queries in parallel
        const [users, total] = await Promise.all([
            this.userModel.find({ isActive: true }).sort(sortOptions).skip(skip).limit(limit).exec(),
            this.userModel.countDocuments({ isActive: true }),
        ]);

        const meta = new PaginationMetaDto(page, limit, total);
        return new PaginatedResponseDto(users, meta);
    }

    /**
     * Find user by ID
     * @param id - User ID
     * @returns User document
     */
    async findOne(id: string): Promise<UserDocument> {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new BadRequestException('Invalid user ID format');
        }

        const user = await this.userModel.findById(id);
        if (!user || !user.isActive) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    /**
     * Find user by email
     * @param email - User email
     * @returns User document or null
     */
    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email: email.toLowerCase(), isActive: true });
    }

    /**
     * Find user by username
     * @param username - Username
     * @returns User document or null
     */
    async findByUsername(username: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ username, isActive: true });
    }

    /**
     * Update user information
     * @param id - User ID
     * @param updateUserDto - Update data
     * @returns Updated user document
     */
    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
        const user = await this.findOne(id);

        // Update user
        Object.assign(user, updateUserDto);
        user.updatedAt = new Date();

        return user.save();
    }

    /**
     * Soft delete user (deactivate)
     * @param id - User ID
     * @returns Updated user document
     */
    async remove(id: string): Promise<UserDocument> {
        const user = await this.findOne(id);

        user.isActive = false;
        user.updatedAt = new Date();

        return user.save();
    }

    /**
     * Restore deactivated user
     * @param id - User ID
     * @returns Restored user document
     */
    async restore(id: string): Promise<UserDocument> {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new BadRequestException('Invalid user ID format');
        }

        const user = await this.userModel.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.isActive = true;
        user.updatedAt = new Date();

        return user.save();
    }

    /**
     * Verify user password
     * @param user - User document
     * @param password - Plain text password
     * @returns Boolean indicating if password is correct
     */
    async verifyPassword(user: UserDocument, password: string): Promise<boolean> {
        return bcrypt.compare(password, user.password);
    }

    /**
     * Update user password
     * @param id - User ID
     * @param newPassword - New password
     * @returns Updated user document
     */
    async updatePassword(id: string, newPassword: string): Promise<UserDocument> {
        const user = await this.findOne(id);

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        user.password = hashedPassword;
        user.updatedAt = new Date();

        return user.save();
    }

    /**
     * Update last login timestamp
     * @param id - User ID
     * @returns Updated user document
     */
    async updateLastLogin(id: string): Promise<UserDocument> {
        const user = await this.findOne(id);

        user.lastLoginAt = new Date();
        user.updatedAt = new Date();

        return user.save();
    }

    /**
     * Verify user email
     * @param id - User ID
     * @returns Updated user document
     */
    async verifyEmail(id: string): Promise<UserDocument> {
        const user = await this.findOne(id);

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.updatedAt = new Date();

        return user.save();
    }

    /**
     * Get user statistics
     * @returns User statistics object
     */
    async getStatistics(): Promise<{
        total: number;
        active: number;
        inactive: number;
        verified: number;
        unverified: number;
    }> {
        const [total, active, verified] = await Promise.all([
            this.userModel.countDocuments(),
            this.userModel.countDocuments({ isActive: true }),
            this.userModel.countDocuments({ isEmailVerified: true, isActive: true }),
        ]);

        return {
            total,
            active,
            inactive: total - active,
            verified,
            unverified: active - verified,
        };
    }
}
