import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    HttpCode,
    HttpStatus,
    UseGuards,
    Logger,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { FoodService } from './food.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { FoodQueryDto } from './dto/food-query.dto';
import { FoodResponseDto, FoodListResponseDto } from './dto/food-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Foods')
@Controller('api/v1/foods')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FoodController {
    private readonly logger = new Logger(FoodController.name);

    constructor(private readonly foodService: FoodService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new food item',
        description: 'Creates a new food item with nutritional information',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Food created successfully',
        type: FoodResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Food with barcode already exists',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async create(@Body() createFoodDto: CreateFoodDto): Promise<{
        statusCode: number;
        message: string;
        data: FoodResponseDto;
    }> {
        this.logger.log(`Creating food: ${createFoodDto.name}`);

        const food = await this.foodService.create(createFoodDto);

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Food created successfully',
            data: food as any,
        };
    }

    @Get()
    @ApiOperation({
        summary: 'Get foods with filtering and pagination',
        description: 'Retrieve foods with advanced filtering, searching, and pagination',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Foods retrieved successfully',
        type: FoodListResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid query parameters',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async findAll(@Query() query: FoodQueryDto): Promise<{
        statusCode: number;
        message: string;
        data: FoodListResponseDto;
    }> {
        this.logger.log(`Querying foods with filters: ${JSON.stringify(query)}`);

        const result = await this.foodService.findAll(query);

        return {
            statusCode: HttpStatus.OK,
            message: 'Foods retrieved successfully',
            data: result,
        };
    }

    @Get('categories')
    @ApiOperation({
        summary: 'Get food categories with counts',
        description: 'Retrieve all food categories with their respective food counts',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Categories retrieved successfully',
        schema: {
            type: 'object',
            example: {
                statusCode: 200,
                message: 'Categories retrieved successfully',
                data: {
                    fruits: 25,
                    vegetables: 40,
                    grains: 15,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async getCategories(): Promise<{
        statusCode: number;
        message: string;
        data: Record<string, number>;
    }> {
        this.logger.log('Getting food categories with counts');

        const categories = await this.foodService.getCategoriesWithCounts();

        return {
            statusCode: HttpStatus.OK,
            message: 'Categories retrieved successfully',
            data: categories,
        };
    }

    @Get('search')
    @ApiOperation({
        summary: 'Search foods by text',
        description: 'Quick search foods by name, nameEn, or description',
    })
    @ApiQuery({
        name: 'q',
        description: 'Search term',
        example: '苹果',
        required: true,
    })
    @ApiQuery({
        name: 'limit',
        description: 'Maximum number of results',
        example: 10,
        required: false,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Search results retrieved successfully',
        type: [FoodResponseDto],
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Missing search term',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async searchFoods(
        @Query('q') searchTerm: string,
        @Query('limit') limit?: number,
    ): Promise<{
        statusCode: number;
        message: string;
        data: FoodResponseDto[];
    }> {
        if (!searchTerm) {
            throw new Error('Search term is required');
        }

        this.logger.log(`Searching foods with term: ${searchTerm}`);

        const foods = await this.foodService.searchFoods(searchTerm, limit);

        return {
            statusCode: HttpStatus.OK,
            message: 'Search results retrieved successfully',
            data: foods as any,
        };
    }

    @Get('barcode/:barcode')
    @ApiOperation({
        summary: 'Find food by barcode',
        description: 'Retrieve food information using barcode',
    })
    @ApiParam({
        name: 'barcode',
        description: 'Food barcode',
        example: '1234567890123',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Food found by barcode',
        type: FoodResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Food not found',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async findByBarcode(@Param('barcode') barcode: string): Promise<{
        statusCode: number;
        message: string;
        data: FoodResponseDto | null;
    }> {
        this.logger.log(`Finding food by barcode: ${barcode}`);

        const food = await this.foodService.findByBarcode(barcode);

        return {
            statusCode: HttpStatus.OK,
            message: food ? 'Food found by barcode' : 'No food found with this barcode',
            data: food as any,
        };
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get food by ID',
        description: 'Retrieve a specific food item by its ID',
    })
    @ApiParam({
        name: 'id',
        description: 'Food ID',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Food retrieved successfully',
        type: FoodResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Food not found',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid food ID format',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async findOne(@Param('id') id: string): Promise<{
        statusCode: number;
        message: string;
        data: FoodResponseDto;
    }> {
        this.logger.log(`Finding food by ID: ${id}`);

        const food = await this.foodService.findOne(id);

        return {
            statusCode: HttpStatus.OK,
            message: 'Food retrieved successfully',
            data: food as any,
        };
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update food by ID',
        description: 'Update a specific food item by its ID',
    })
    @ApiParam({
        name: 'id',
        description: 'Food ID',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Food updated successfully',
        type: FoodResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Food not found',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data or food ID format',
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Food with barcode already exists',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async update(
        @Param('id') id: string,
        @Body() updateFoodDto: UpdateFoodDto,
    ): Promise<{
        statusCode: number;
        message: string;
        data: FoodResponseDto;
    }> {
        this.logger.log(`Updating food with ID: ${id}`);

        const food = await this.foodService.update(id, updateFoodDto);

        return {
            statusCode: HttpStatus.OK,
            message: 'Food updated successfully',
            data: food as any,
        };
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Delete food by ID',
        description: 'Soft delete a specific food item by its ID (sets isActive to false)',
    })
    @ApiParam({
        name: 'id',
        description: 'Food ID',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Food deleted successfully',
        type: FoodResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Food not found',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid food ID format',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async remove(@Param('id') id: string): Promise<{
        statusCode: number;
        message: string;
        data: FoodResponseDto;
    }> {
        this.logger.log(`Deleting food with ID: ${id}`);

        const food = await this.foodService.remove(id);

        return {
            statusCode: HttpStatus.OK,
            message: 'Food deleted successfully',
            data: food as any,
        };
    }

    @Post('bulk')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Bulk create foods',
        description: 'Create multiple food items at once (for data import)',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Foods created successfully',
        schema: {
            type: 'object',
            example: {
                statusCode: 201,
                message: 'Foods created successfully',
                data: {
                    created: 50,
                    total: 52,
                    errors: 2,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async bulkCreate(@Body() foods: CreateFoodDto[]): Promise<{
        statusCode: number;
        message: string;
        data: {
            created: number;
            total: number;
            errors: number;
        };
    }> {
        this.logger.log(`Bulk creating ${foods.length} foods`);

        const createdFoods = await this.foodService.bulkCreate(foods);

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Foods created successfully',
            data: {
                created: createdFoods.length,
                total: foods.length,
                errors: foods.length - createdFoods.length,
            },
        };
    }
} 