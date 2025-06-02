import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Food, FoodDocument } from './schemas/food.schema';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { FoodQueryDto } from './dto/food-query.dto';
import { FoodListResponseDto } from './dto/food-response.dto';

@Injectable()
export class FoodService {
    private readonly logger = new Logger(FoodService.name);

    constructor(
        @InjectModel(Food.name)
        private readonly foodModel: Model<FoodDocument>,
    ) { }

    /**
     * Create a new food item
     * @param createFoodDto Food creation data
     * @returns Created food document
     */
    async create(createFoodDto: CreateFoodDto): Promise<FoodDocument> {
        try {
            this.logger.log(`Creating new food: ${createFoodDto.name}`);

            // Check for duplicate barcode if provided
            if (createFoodDto.barcode) {
                const existingFood = await this.foodModel.findOne({
                    barcode: createFoodDto.barcode,
                    isActive: true,
                });
                if (existingFood) {
                    throw new ConflictException(
                        `Food with barcode ${createFoodDto.barcode} already exists`,
                    );
                }
            }

            const food = new this.foodModel(createFoodDto);
            const savedFood = await food.save();

            this.logger.log(`Successfully created food with ID: ${savedFood._id}`);
            return savedFood;
        } catch (error) {
            this.logger.error(`Failed to create food: ${error.message}`, error.stack);
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new BadRequestException('Failed to create food item');
        }
    }

    /**
     * Find foods with advanced filtering, searching, and pagination
     * @param query Query parameters for filtering and pagination
     * @returns Paginated list of foods
     */
    async findAll(query: FoodQueryDto): Promise<FoodListResponseDto> {
        try {
            const {
                search,
                category,
                subcategories,
                excludeAllergens,
                dietaryTags,
                brand,
                isVerified,
                isActive = true,
                dataSource,
                page = 1,
                limit = 20,
                sortBy = 'name',
                sortOrder = 'asc',
            } = query;

            // Build filter query
            const filter: FilterQuery<FoodDocument> = {};

            // Basic filters
            if (isActive !== undefined) {
                filter.isActive = isActive;
            }

            if (category) {
                filter.category = category;
            }

            if (brand) {
                filter.brand = new RegExp(brand, 'i');
            }

            if (isVerified !== undefined) {
                filter.isVerified = isVerified;
            }

            if (dataSource) {
                filter.dataSource = dataSource;
            }

            // Array filters
            if (subcategories && subcategories.length > 0) {
                filter.subcategories = { $in: subcategories };
            }

            if (dietaryTags && dietaryTags.length > 0) {
                filter.dietaryTags = { $all: dietaryTags };
            }

            // Exclude allergens (foods that do NOT contain specified allergens)
            if (excludeAllergens && excludeAllergens.length > 0) {
                filter.allergens = { $nin: excludeAllergens };
            }

            // Text search
            if (search) {
                filter.$text = { $search: search };
            }

            // Calculate pagination
            const skip = (page - 1) * limit;

            // Build sort object
            const sortField = sortBy === 'calories' ? 'nutrition.calories' : sortBy;
            const sort: Record<string, 1 | -1> = { [sortField]: sortOrder === 'desc' ? -1 : 1 };

            this.logger.log(
                `Querying foods with filter: ${JSON.stringify(filter)}, page: ${page}, limit: ${limit}`,
            );

            // Execute query with pagination
            const [foods, totalCount] = await Promise.all([
                this.foodModel
                    .find(filter)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .lean()
                    .exec(),
                this.foodModel.countDocuments(filter).exec(),
            ]);

            // Calculate pagination metadata
            const totalPages = Math.ceil(totalCount / limit);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;

            this.logger.log(`Found ${foods.length} foods out of ${totalCount} total`);

            return {
                foods: foods as any,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    hasNextPage,
                    hasPreviousPage,
                },
            };
        } catch (error) {
            this.logger.error(`Failed to query foods: ${error.message}`, error.stack);
            throw new BadRequestException('Failed to retrieve foods');
        }
    }

    /**
     * Find a food by ID
     * @param id Food ID
     * @returns Food document
     */
    async findOne(id: string): Promise<FoodDocument> {
        try {
            this.logger.log(`Finding food by ID: ${id}`);

            const food = await this.foodModel.findById(id).exec();
            if (!food) {
                throw new NotFoundException(`Food with ID ${id} not found`);
            }

            this.logger.log(`Successfully found food: ${food.name}`);
            return food;
        } catch (error) {
            this.logger.error(`Failed to find food by ID: ${error.message}`, error.stack);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Invalid food ID format');
        }
    }

    /**
     * Find a food by barcode
     * @param barcode Food barcode
     * @returns Food document or null
     */
    async findByBarcode(barcode: string): Promise<FoodDocument | null> {
        try {
            this.logger.log(`Finding food by barcode: ${barcode}`);

            const food = await this.foodModel.findOne({
                barcode,
                isActive: true,
            }).exec();

            if (food) {
                this.logger.log(`Found food by barcode: ${food.name}`);
            } else {
                this.logger.log(`No food found with barcode: ${barcode}`);
            }

            return food;
        } catch (error) {
            this.logger.error(`Failed to find food by barcode: ${error.message}`, error.stack);
            throw new BadRequestException('Failed to search by barcode');
        }
    }

    /**
     * Update a food item
     * @param id Food ID
     * @param updateFoodDto Update data
     * @returns Updated food document
     */
    async update(id: string, updateFoodDto: UpdateFoodDto): Promise<FoodDocument> {
        try {
            this.logger.log(`Updating food with ID: ${id}`);

            // Check for barcode conflicts if barcode is being updated
            if (updateFoodDto.barcode) {
                const existingFood = await this.foodModel.findOne({
                    _id: { $ne: id },
                    barcode: updateFoodDto.barcode,
                    isActive: true,
                });
                if (existingFood) {
                    throw new ConflictException(
                        `Food with barcode ${updateFoodDto.barcode} already exists`,
                    );
                }
            }

            const updatedFood = await this.foodModel
                .findByIdAndUpdate(
                    id,
                    { ...updateFoodDto, updatedAt: new Date() },
                    { new: true, runValidators: true },
                )
                .exec();

            if (!updatedFood) {
                throw new NotFoundException(`Food with ID ${id} not found`);
            }

            this.logger.log(`Successfully updated food: ${updatedFood.name}`);
            return updatedFood;
        } catch (error) {
            this.logger.error(`Failed to update food: ${error.message}`, error.stack);
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            throw new BadRequestException('Failed to update food item');
        }
    }

    /**
     * Soft delete a food item (set isActive to false)
     * @param id Food ID
     * @returns Deleted food document
     */
    async remove(id: string): Promise<FoodDocument> {
        try {
            this.logger.log(`Soft deleting food with ID: ${id}`);

            const deletedFood = await this.foodModel
                .findByIdAndUpdate(
                    id,
                    { isActive: false, updatedAt: new Date() },
                    { new: true },
                )
                .exec();

            if (!deletedFood) {
                throw new NotFoundException(`Food with ID ${id} not found`);
            }

            this.logger.log(`Successfully deleted food: ${deletedFood.name}`);
            return deletedFood;
        } catch (error) {
            this.logger.error(`Failed to delete food: ${error.message}`, error.stack);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to delete food item');
        }
    }

    /**
     * Get food categories with counts
     * @returns Object with category names and their food counts
     */
    async getCategoriesWithCounts(): Promise<Record<string, number>> {
        try {
            this.logger.log('Getting food categories with counts');

            const categories = await this.foodModel.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { _id: 1 } },
            ]);

            const result = categories.reduce((acc, cat) => {
                acc[cat._id] = cat.count;
                return acc;
            }, {});

            this.logger.log(`Found ${categories.length} categories`);
            return result;
        } catch (error) {
            this.logger.error(`Failed to get categories: ${error.message}`, error.stack);
            throw new BadRequestException('Failed to retrieve food categories');
        }
    }

    /**
     * Bulk create foods (for data import)
     * @param foods Array of food creation data
     * @returns Array of created food documents
     */
    async bulkCreate(foods: CreateFoodDto[]): Promise<FoodDocument[]> {
        try {
            this.logger.log(`Bulk creating ${foods.length} foods`);

            const createdFoods = await this.foodModel.insertMany(foods, {
                ordered: false, // Continue on error
            });

            this.logger.log(`Successfully created ${createdFoods.length} foods in bulk`);
            return createdFoods;
        } catch (error) {
            this.logger.error(`Failed to bulk create foods: ${error.message}`, error.stack);
            throw new BadRequestException('Failed to bulk create foods');
        }
    }

    /**
     * Search foods by text (name, nameEn, description)
     * @param searchTerm Search term
     * @param limit Maximum number of results
     * @returns Array of matching foods
     */
    async searchFoods(searchTerm: string, limit: number = 10): Promise<FoodDocument[]> {
        try {
            this.logger.log(`Searching foods with term: ${searchTerm}`);

            const foods = await this.foodModel
                .find({
                    $text: { $search: searchTerm },
                    isActive: true,
                })
                .sort({ score: { $meta: 'textScore' } })
                .limit(limit)
                .exec();

            this.logger.log(`Found ${foods.length} foods matching search term`);
            return foods;
        } catch (error) {
            this.logger.error(`Failed to search foods: ${error.message}`, error.stack);
            throw new BadRequestException('Failed to search foods');
        }
    }
} 