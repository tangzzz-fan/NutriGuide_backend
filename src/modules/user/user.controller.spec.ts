import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

describe('UserController', () => {
    let controller: UserController;

    const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: jest.fn().mockReturnValue({
            id: '507f1f77bcf86cd799439011',
            email: 'test@example.com',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
            isActive: true,
            isEmailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        }),
    };

    const mockUserService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        restore: jest.fn(),
        verifyEmail: jest.fn(),
        getStatistics: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        // Create method has been moved to AuthController.register
        // This test is no longer applicable
    });

    describe('findAll', () => {
        const paginationQuery: PaginationQueryDto = {
            page: 1,
            limit: 20,
            sortBy: 'createdAt',
            order: 'desc',
        };

        it('should return paginated users', async () => {
            // Arrange
            const paginatedResult = {
                data: [mockUser],
                meta: {
                    page: 1,
                    limit: 20,
                    total: 1,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            };
            mockUserService.findAll.mockResolvedValue(paginatedResult);

            // Act
            const result = await controller.findAll(paginationQuery);

            // Assert
            expect(mockUserService.findAll).toHaveBeenCalledWith(paginationQuery);
            expect(result.statusCode).toBe(HttpStatus.OK);
            expect(result.message).toBe('Users retrieved successfully');
            expect(result.data.data).toHaveLength(1);
            expect(result.data.meta.total).toBe(1);
        });
    });

    describe('getStatistics', () => {
        it('should return user statistics', async () => {
            // Arrange
            const statistics = {
                total: 100,
                active: 90,
                inactive: 10,
                verified: 75,
                unverified: 15,
            };
            mockUserService.getStatistics.mockResolvedValue(statistics);

            // Act
            const result = await controller.getStatistics();

            // Assert
            expect(mockUserService.getStatistics).toHaveBeenCalled();
            expect(result.statusCode).toBe(HttpStatus.OK);
            expect(result.message).toBe('User statistics retrieved successfully');
            expect(result.data).toEqual(statistics);
        });
    });

    describe('findOne', () => {
        const userId = '507f1f77bcf86cd799439011';

        it('should return a user by ID', async () => {
            // Arrange
            mockUserService.findOne.mockResolvedValue(mockUser);

            // Act
            const result = await controller.findOne(userId);

            // Assert
            expect(mockUserService.findOne).toHaveBeenCalledWith(userId);
            expect(result.statusCode).toBe(HttpStatus.OK);
            expect(result.message).toBe('User retrieved successfully');
            expect(result.data).toEqual(mockUser.toJSON());
        });
    });

    describe('update', () => {
        const userId = '507f1f77bcf86cd799439011';
        const updateUserDto: UpdateUserDto = {
            firstName: 'Updated',
            lastName: 'Name',
        };

        it('should update a user', async () => {
            // Arrange
            const updatedUser = { ...mockUser, ...updateUserDto };
            mockUserService.update.mockResolvedValue(updatedUser);

            // Act
            const result = await controller.update(userId, updateUserDto);

            // Assert
            expect(mockUserService.update).toHaveBeenCalledWith(userId, updateUserDto);
            expect(result.statusCode).toBe(HttpStatus.OK);
            expect(result.message).toBe('User updated successfully');
            expect(result.data).toEqual(updatedUser.toJSON());
        });
    });

    describe('remove', () => {
        const userId = '507f1f77bcf86cd799439011';

        it('should soft delete a user', async () => {
            // Arrange
            const deletedUser = { ...mockUser, isActive: false };
            mockUserService.remove.mockResolvedValue(deletedUser);

            // Act
            const result = await controller.remove(userId);

            // Assert
            expect(mockUserService.remove).toHaveBeenCalledWith(userId);
            expect(result.statusCode).toBe(HttpStatus.OK);
            expect(result.message).toBe('User deleted successfully');
            expect(result.data).toEqual({ id: userId });
        });
    });

    describe('restore', () => {
        const userId = '507f1f77bcf86cd799439011';

        it('should restore a deactivated user', async () => {
            // Arrange
            const restoredUser = { ...mockUser, isActive: true };
            mockUserService.restore.mockResolvedValue(restoredUser);

            // Act
            const result = await controller.restore(userId);

            // Assert
            expect(mockUserService.restore).toHaveBeenCalledWith(userId);
            expect(result.statusCode).toBe(HttpStatus.OK);
            expect(result.message).toBe('User restored successfully');
            expect(result.data).toEqual(restoredUser.toJSON());
        });
    });

    describe('verifyEmail', () => {
        const userId = '507f1f77bcf86cd799439011';

        it('should verify user email', async () => {
            // Arrange
            const verifiedUser = { ...mockUser, isEmailVerified: true };
            mockUserService.verifyEmail.mockResolvedValue(verifiedUser);

            // Act
            const result = await controller.verifyEmail(userId);

            // Assert
            expect(mockUserService.verifyEmail).toHaveBeenCalledWith(userId);
            expect(result.statusCode).toBe(HttpStatus.OK);
            expect(result.message).toBe('Email verified successfully');
            expect(result.data).toEqual({ verified: true });
        });
    });
});
