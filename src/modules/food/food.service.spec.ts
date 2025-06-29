import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FoodService } from './food.service';
import { Food, FoodDocument } from './schemas/food.schema';
import { CreateFoodDto } from './dto/create-food.dto';
import { FoodQueryDto } from './dto/food-query.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('FoodService', () => {
    let service: FoodService;
    let model: Model<FoodDocument>;

    const mockFood = {
        _id: '507f1f77bcf86cd799439011',
        name: '苹果',
        nameEn: 'Apple',
        category: 'fruits',
        nutrition: {
            calories: 52,
            protein: 0.3,
            carbohydrates: 14,
            fat: 0.2,
        },
        isActive: true,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockFoodModel = {
        find: jest.fn(),
        findById: jest.fn(),
        findOne: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        countDocuments: jest.fn(),
        aggregate: jest.fn(),
        insertMany: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FoodService,
                {
                    provide: getModelToken(Food.name),
                    useValue: mockFoodModel,
                },
            ],
        }).compile();

        service = module.get<FoodService>(FoodService);
        model = module.get<Model<FoodDocument>>(getModelToken(Food.name));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new food successfully', async () => {
            const createFoodDto: CreateFoodDto = {
                name: '苹果',
                nameEn: 'Apple',
                category: 'fruits',
                nutrition: {
                    calories: 52,
                    protein: 0.3,
                    carbohydrates: 14,
                    fat: 0.2,
                },
            };

            const savedFood = { ...mockFood, save: jest.fn().mockResolvedValue(mockFood) };
            const ModelConstructor = jest.fn().mockImplementation(() => savedFood);

            // Mock existing food checks
            jest.spyOn(model, 'findOne').mockResolvedValue(null);

            // Replace the model in the service
            (service as any).foodModel = Object.assign(ModelConstructor, model);

            const result = await service.create(createFoodDto);

            expect(ModelConstructor).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: createFoodDto.name,
                    category: createFoodDto.category,
                })
            );
            expect(savedFood.save).toHaveBeenCalled();
            expect(result).toEqual(mockFood);
        });

        it('should throw ConflictException when barcode already exists', async () => {
            const createFoodDto: CreateFoodDto = {
                name: '苹果',
                category: 'fruits',
                barcode: '1234567890123',
                nutrition: {
                    calories: 52,
                    protein: 0.3,
                    carbohydrates: 14,
                    fat: 0.2,
                },
            };

            jest.spyOn(model, 'findOne').mockResolvedValue(mockFood as any);

            await expect(service.create(createFoodDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('findAll', () => {
        it('should return paginated foods', async () => {
            const query: FoodQueryDto = {
                page: 1,
                limit: 10,
            };

            const mockQuery = {
                find: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue([mockFood]),
            };

            jest.spyOn(model, 'find').mockReturnValue(mockQuery as any);
            jest.spyOn(model, 'countDocuments').mockReturnValue({
                exec: jest.fn().mockResolvedValue(1),
            } as any);

            const result = await service.findAll(query);

            expect(result).toHaveProperty('foods');
            expect(result).toHaveProperty('pagination');
            expect(result.foods).toHaveLength(1);
            expect(result.pagination.totalCount).toBe(1);
        });
    });

    describe('findOne', () => {
        it('should return a food by ID', async () => {
            const foodId = '507f1f77bcf86cd799439011';

            jest.spyOn(model, 'findById').mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockFood),
            } as any);

            const result = await service.findOne(foodId);

            expect(result).toEqual(mockFood);
            expect(model.findById).toHaveBeenCalledWith(foodId);
        });

        it('should throw NotFoundException when food not found', async () => {
            const foodId = '507f1f77bcf86cd799439011';

            jest.spyOn(model, 'findById').mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            } as any);

            await expect(service.findOne(foodId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findByBarcode', () => {
        it('should return food by barcode', async () => {
            const barcode = '1234567890123';

            jest.spyOn(model, 'findOne').mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockFood),
            } as any);

            const result = await service.findByBarcode(barcode);

            expect(result).toEqual(mockFood);
            expect(model.findOne).toHaveBeenCalledWith({
                barcode,
                isActive: true,
            });
        });

        it('should return null when food not found by barcode', async () => {
            const barcode = '1234567890123';

            jest.spyOn(model, 'findOne').mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            } as any);

            const result = await service.findByBarcode(barcode);

            expect(result).toBeNull();
        });
    });

    describe('getCategoriesWithCounts', () => {
        it('should return categories with counts', async () => {
            const mockCategories = [
                { _id: 'fruits', count: 5 },
                { _id: 'vegetables', count: 10 },
            ];

            jest.spyOn(model, 'aggregate').mockResolvedValue(mockCategories);

            const result = await service.getCategoriesWithCounts();

            expect(result).toEqual({
                fruits: 5,
                vegetables: 10,
            });
        });
    });

    describe('searchFoods', () => {
        it('should return search results', async () => {
            const searchTerm = '苹果';
            const limit = 10;

            const mockQuery = {
                find: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue([mockFood]),
            };

            jest.spyOn(model, 'find').mockReturnValue(mockQuery as any);

            const result = await service.searchFoods(searchTerm, limit);

            expect(result).toEqual([mockFood]);
            expect(model.find).toHaveBeenCalledWith({
                $text: { $search: searchTerm },
                isActive: true,
            });
        });
    });
}); 