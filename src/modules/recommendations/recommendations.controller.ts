import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    HttpStatus,
    UseGuards,
    Logger,
    Request,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiQuery,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { RecommendationQueryDto } from './dto/recommendation-query.dto';
import { RecommendationResponseDto } from './dto/recommendation-response.dto';
import { RecommendationFeedbackDto } from './dto/recommendation-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Recommendations')
@Controller('recommendations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RecommendationsController {
    private readonly logger = new Logger(RecommendationsController.name);

    constructor(private readonly recommendationsService: RecommendationsService) { }

    @Get('foods')
    @ApiOperation({
        summary: 'Get food recommendations',
        description: 'Get personalized food recommendations based on user preferences and history',
    })
    @ApiQuery({
        name: 'limit',
        description: 'Number of recommendations to return',
        example: 10,
        required: false,
    })
    @ApiQuery({
        name: 'dietaryTags',
        description: 'Dietary preferences to consider',
        example: 'vegetarian,low-carb',
        required: false,
    })
    @ApiQuery({
        name: 'allergens',
        description: 'Allergens to avoid',
        example: 'nuts,dairy',
        required: false,
    })
    @ApiQuery({
        name: 'mealType',
        description: 'Meal type for recommendations',
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        required: false,
    })
    @ApiQuery({
        name: 'maxCalories',
        description: 'Maximum calories per serving',
        example: 500,
        required: false,
    })
    @ApiQuery({
        name: 'minProtein',
        description: 'Minimum protein per serving (in grams)',
        example: 20,
        required: false,
    })
    @ApiQuery({
        name: 'excludeRecent',
        description: 'Exclude recently consumed foods',
        example: true,
        required: false,
    })
    @ApiQuery({
        name: 'personalization',
        description: 'Personalization level',
        enum: ['basic', 'moderate', 'high'],
        example: 'moderate',
        required: false,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Food recommendations retrieved successfully',
        type: RecommendationResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid query parameters',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async getFoodRecommendations(
        @Request() req: any,
        @Query() query: any,
    ): Promise<{
        statusCode: number;
        message: string;
        data: RecommendationResponseDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Getting food recommendations for user ${userId}`);

        const recommendationQuery: RecommendationQueryDto = {
            type: 'foods',
            ...query,
            dietaryTags: query.dietaryTags ? query.dietaryTags.split(',') : undefined,
            allergens: query.allergens ? query.allergens.split(',') : undefined,
        };

        const recommendations = await this.recommendationsService.getRecommendations(userId, recommendationQuery);

        return {
            statusCode: HttpStatus.OK,
            message: 'Food recommendations retrieved successfully',
            data: recommendations,
        };
    }

    @Get('recipes')
    @ApiOperation({
        summary: 'Get recipe recommendations',
        description: 'Get personalized recipe recommendations based on user preferences and cooking history',
    })
    @ApiQuery({
        name: 'limit',
        description: 'Number of recommendations to return',
        example: 10,
        required: false,
    })
    @ApiQuery({
        name: 'dietaryTags',
        description: 'Dietary preferences to consider',
        example: 'vegetarian,mediterranean',
        required: false,
    })
    @ApiQuery({
        name: 'maxPrepTime',
        description: 'Maximum preparation time in minutes',
        example: 30,
        required: false,
    })
    @ApiQuery({
        name: 'maxCalories',
        description: 'Maximum calories per serving',
        example: 600,
        required: false,
    })
    @ApiQuery({
        name: 'highRatedOnly',
        description: 'Include only highly rated recipes',
        example: false,
        required: false,
    })
    @ApiQuery({
        name: 'personalization',
        description: 'Personalization level',
        enum: ['basic', 'moderate', 'high'],
        example: 'moderate',
        required: false,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Recipe recommendations retrieved successfully',
        type: RecommendationResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid query parameters',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async getRecipeRecommendations(
        @Request() req: any,
        @Query() query: any,
    ): Promise<{
        statusCode: number;
        message: string;
        data: RecommendationResponseDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Getting recipe recommendations for user ${userId}`);

        const recommendationQuery: RecommendationQueryDto = {
            type: 'recipes',
            ...query,
            dietaryTags: query.dietaryTags ? query.dietaryTags.split(',') : undefined,
            allergens: query.allergens ? query.allergens.split(',') : undefined,
        };

        const recommendations = await this.recommendationsService.getRecommendations(userId, recommendationQuery);

        return {
            statusCode: HttpStatus.OK,
            message: 'Recipe recommendations retrieved successfully',
            data: recommendations,
        };
    }

    @Get('meal-plans')
    @ApiOperation({
        summary: 'Get meal plan recommendations',
        description: 'Get personalized meal plan recommendations based on user goals and preferences',
    })
    @ApiQuery({
        name: 'limit',
        description: 'Number of recommendations to return',
        example: 5,
        required: false,
    })
    @ApiQuery({
        name: 'maxCalories',
        description: 'Maximum daily calories',
        example: 2000,
        required: false,
    })
    @ApiQuery({
        name: 'dietaryTags',
        description: 'Dietary preferences to consider',
        example: 'keto,low-carb',
        required: false,
    })
    @ApiQuery({
        name: 'personalization',
        description: 'Personalization level',
        enum: ['basic', 'moderate', 'high'],
        example: 'moderate',
        required: false,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Meal plan recommendations retrieved successfully',
        type: RecommendationResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid query parameters',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async getMealPlanRecommendations(
        @Request() req: any,
        @Query() query: any,
    ): Promise<{
        statusCode: number;
        message: string;
        data: RecommendationResponseDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Getting meal plan recommendations for user ${userId}`);

        const recommendationQuery: RecommendationQueryDto = {
            type: 'meal-plans',
            ...query,
            dietaryTags: query.dietaryTags ? query.dietaryTags.split(',') : undefined,
            allergens: query.allergens ? query.allergens.split(',') : undefined,
        };

        const recommendations = await this.recommendationsService.getRecommendations(userId, recommendationQuery);

        return {
            statusCode: HttpStatus.OK,
            message: 'Meal plan recommendations retrieved successfully',
            data: recommendations,
        };
    }

    @Post('feedback')
    @ApiOperation({
        summary: 'Submit recommendation feedback',
        description: 'Submit user feedback on recommendations to improve future suggestions',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Feedback submitted successfully',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 200 },
                message: { type: 'string', example: 'Feedback submitted successfully' },
                data: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid feedback data',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async submitFeedback(
        @Request() req: any,
        @Body() feedback: RecommendationFeedbackDto,
    ): Promise<{
        statusCode: number;
        message: string;
        data: { success: boolean };
    }> {
        const userId = req.user.id;
        this.logger.log(`Receiving feedback from user ${userId} for ${feedback.itemType} ${feedback.itemId}: ${feedback.action}`);

        const result = await this.recommendationsService.submitFeedback(userId, feedback);

        return {
            statusCode: HttpStatus.OK,
            message: 'Feedback submitted successfully',
            data: result,
        };
    }
} 