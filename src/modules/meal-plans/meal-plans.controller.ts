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
    Request,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { MealPlansService } from './meal-plans.service';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { MealPlanQueryDto } from './dto/meal-plan-query.dto';
import {
    MealPlanResponseDto,
    MealPlanListResponseDto,
    GenerateMealPlanDto
} from './dto/meal-plan-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Meal Plans')
@Controller('meal-plans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MealPlansController {
    private readonly logger = new Logger(MealPlansController.name);

    constructor(private readonly mealPlansService: MealPlansService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new meal plan',
        description: 'Creates a new meal plan with detailed meal schedules',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Meal plan created successfully',
        type: MealPlanResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data or food items not found',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async create(
        @Request() req: any,
        @Body() createMealPlanDto: CreateMealPlanDto,
    ): Promise<{
        statusCode: number;
        message: string;
        data: MealPlanResponseDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Creating meal plan for user ${userId}: ${createMealPlanDto.name}`);

        const mealPlan = await this.mealPlansService.create(userId, createMealPlanDto);

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Meal plan created successfully',
            data: mealPlan as any,
        };
    }

    @Get()
    @ApiOperation({
        summary: 'Get meal plans with filtering and pagination',
        description: 'Retrieve user meal plans with advanced filtering and pagination',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Meal plans retrieved successfully',
        type: MealPlanListResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid query parameters',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async findAll(
        @Request() req: any,
        @Query() query: MealPlanQueryDto,
    ): Promise<{
        statusCode: number;
        message: string;
        data: MealPlanListResponseDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Querying meal plans for user ${userId} with filters: ${JSON.stringify(query)}`);

        const result = await this.mealPlansService.findAll(userId, query);

        return {
            statusCode: HttpStatus.OK,
            message: 'Meal plans retrieved successfully',
            data: result,
        };
    }

    @Get('weekly/:date')
    @ApiOperation({
        summary: 'Get weekly meal plans',
        description: 'Retrieve all meal plans for a specific week',
    })
    @ApiParam({
        name: 'date',
        description: 'Any date within the week in YYYY-MM-DD format',
        example: '2024-01-27',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Weekly meal plans retrieved successfully',
        type: [MealPlanResponseDto],
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid date format',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async findWeeklyPlans(
        @Request() req: any,
        @Param('date') date: string,
    ): Promise<{
        statusCode: number;
        message: string;
        data: MealPlanResponseDto[];
    }> {
        const userId = req.user.id;
        this.logger.log(`Getting weekly meal plans for user ${userId} for week containing ${date}`);

        const plans = await this.mealPlansService.findWeeklyPlans(userId, date);

        return {
            statusCode: HttpStatus.OK,
            message: 'Weekly meal plans retrieved successfully',
            data: plans as any,
        };
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get a specific meal plan',
        description: 'Retrieve a specific meal plan by ID',
    })
    @ApiParam({
        name: 'id',
        description: 'Meal plan ID',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Meal plan retrieved successfully',
        type: MealPlanResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Meal plan not found',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async findOne(
        @Request() req: any,
        @Param('id') id: string,
    ): Promise<{
        statusCode: number;
        message: string;
        data: MealPlanResponseDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Getting meal plan ${id} for user ${userId}`);

        const mealPlan = await this.mealPlansService.findOne(userId, id);

        return {
            statusCode: HttpStatus.OK,
            message: 'Meal plan retrieved successfully',
            data: mealPlan as any,
        };
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update a meal plan',
        description: 'Update a specific meal plan',
    })
    @ApiParam({
        name: 'id',
        description: 'Meal plan ID',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Meal plan updated successfully',
        type: MealPlanResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Meal plan not found',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async update(
        @Request() req: any,
        @Param('id') id: string,
        @Body() updateMealPlanDto: UpdateMealPlanDto,
    ): Promise<{
        statusCode: number;
        message: string;
        data: MealPlanResponseDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Updating meal plan ${id} for user ${userId}`);

        const updatedPlan = await this.mealPlansService.update(userId, id, updateMealPlanDto);

        return {
            statusCode: HttpStatus.OK,
            message: 'Meal plan updated successfully',
            data: updatedPlan as any,
        };
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Delete a meal plan',
        description: 'Soft delete a specific meal plan',
    })
    @ApiParam({
        name: 'id',
        description: 'Meal plan ID',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Meal plan deleted successfully',
        type: MealPlanResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Meal plan not found',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async remove(
        @Request() req: any,
        @Param('id') id: string,
    ): Promise<{
        statusCode: number;
        message: string;
        data: MealPlanResponseDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Deleting meal plan ${id} for user ${userId}`);

        const deletedPlan = await this.mealPlansService.remove(userId, id);

        return {
            statusCode: HttpStatus.OK,
            message: 'Meal plan deleted successfully',
            data: deletedPlan as any,
        };
    }

    @Post('generate')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Generate AI-powered meal plan',
        description: 'Generate a meal plan using AI based on user goals and preferences',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'AI meal plan generated successfully',
        type: MealPlanResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid generation parameters or insufficient food data',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async generateMealPlan(
        @Request() req: any,
        @Body() generateDto: GenerateMealPlanDto,
    ): Promise<{
        statusCode: number;
        message: string;
        data: MealPlanResponseDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Generating AI meal plan for user ${userId} with goal: ${generateDto.goal}`);

        const generatedPlan = await this.mealPlansService.generateMealPlan(userId, generateDto);

        return {
            statusCode: HttpStatus.CREATED,
            message: 'AI meal plan generated successfully',
            data: generatedPlan as any,
        };
    }
} 