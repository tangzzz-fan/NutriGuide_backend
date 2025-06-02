import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiBody,
    ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserPreferencesService } from '../services/user-preferences.service';
import {
    CreateUserPreferencesDto,
    UpdateUserPreferencesDto,
    UserPreferencesResponseDto,
    MealTimingDto,
    NutritionFocusDto,
} from '../dto/user-preferences.dto';
import { ResponseDto } from '../../../common/dto/response.dto';

@ApiTags('User Preferences')
@Controller('users/profile/preferences')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserPreferencesController {
    private readonly logger = new Logger(UserPreferencesController.name);

    constructor(private readonly userPreferencesService: UserPreferencesService) { }

    /**
     * Create or update user preferences
     * API-1.2.2: PUT /users/profile/preferences
     */
    @Put()
    @ApiOperation({
        summary: 'Create or update user preferences',
        description: 'Create or update user personalized preference settings (dietary guidelines, taste, regional, restrictions, cooking preferences, etc.)',
    })
    @ApiBody({ type: CreateUserPreferencesDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User preferences updated successfully',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User preferences created successfully',
    })
    async createOrUpdatePreferences(
        @Request() req: any,
        @Body() preferencesDto: CreateUserPreferencesDto,
    ): Promise<ResponseDto<any>> {
        this.logger.log(`Creating/updating preferences for user: ${req.user.userId}`);

        try {
            // Try to get existing preferences
            const existingPreferences = await this.userPreferencesService.getPreferencesByUserId(req.user.userId);

            // Update existing preferences
            const updatedPreferences = await this.userPreferencesService.updatePreferences(
                req.user.userId,
                preferencesDto,
            );

            return new ResponseDto(
                HttpStatus.OK,
                'User preferences updated successfully',
                updatedPreferences.toJSON(),
            );
        } catch (error) {
            // If preferences don't exist, create new ones
            if (error.message === 'User preferences not found') {
                const newPreferences = await this.userPreferencesService.createPreferences(
                    req.user.userId,
                    preferencesDto,
                );

                return new ResponseDto(
                    HttpStatus.CREATED,
                    'User preferences created successfully',
                    newPreferences.toJSON(),
                );
            }
            throw error;
        }
    }

    /**
     * Get user preferences
     * Part of API-1.2.3: GET /users/profile
     */
    @Get()
    @ApiOperation({
        summary: 'Get user preferences',
        description: 'Retrieve user preference settings',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User preferences retrieved successfully',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User preferences not found',
    })
    async getPreferences(@Request() req: any): Promise<ResponseDto<any>> {
        this.logger.log(`Getting preferences for user: ${req.user.userId}`);

        const preferences = await this.userPreferencesService.getOrCreateDefaultPreferences(req.user.userId);

        return new ResponseDto(
            HttpStatus.OK,
            'User preferences retrieved successfully',
            preferences.toJSON(),
        );
    }

    /**
     * Update meal timing preferences
     */
    @Put('meal-timing')
    @ApiOperation({
        summary: 'Update meal timing preferences',
        description: 'Update preferred meal times',
    })
    @ApiBody({ type: MealTimingDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Meal timing preferences updated successfully',
    })
    async updateMealTiming(
        @Request() req: any,
        @Body() mealTimingDto: MealTimingDto,
    ): Promise<ResponseDto<any>> {
        this.logger.log(`Updating meal timing for user: ${req.user.userId}`);

        const updatedPreferences = await this.userPreferencesService.updateMealTiming(
            req.user.userId,
            mealTimingDto,
        );

        return new ResponseDto(
            HttpStatus.OK,
            'Meal timing preferences updated successfully',
            updatedPreferences.toJSON(),
        );
    }

    /**
     * Update nutrition focus preferences
     */
    @Put('nutrition-focus')
    @ApiOperation({
        summary: 'Update nutrition focus preferences',
        description: 'Update nutrition focus settings',
    })
    @ApiBody({ type: NutritionFocusDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Nutrition focus preferences updated successfully',
    })
    async updateNutritionFocus(
        @Request() req: any,
        @Body() nutritionFocusDto: NutritionFocusDto,
    ): Promise<ResponseDto<any>> {
        this.logger.log(`Updating nutrition focus for user: ${req.user.userId}`);

        const updatedPreferences = await this.userPreferencesService.updateNutritionFocus(
            req.user.userId,
            nutritionFocusDto,
        );

        return new ResponseDto(
            HttpStatus.OK,
            'Nutrition focus preferences updated successfully',
            updatedPreferences.toJSON(),
        );
    }

    /**
     * Add favorite ingredient
     */
    @Post('ingredients/favorites/:ingredient')
    @ApiOperation({
        summary: 'Add favorite ingredient',
        description: 'Add an ingredient to user favorites',
    })
    @ApiParam({ name: 'ingredient', description: 'Ingredient name' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Ingredient added to favorites successfully',
    })
    async addFavoriteIngredient(
        @Request() req: any,
        @Param('ingredient') ingredient: string,
    ): Promise<ResponseDto<any>> {
        this.logger.log(`Adding favorite ingredient for user: ${req.user.userId}`);

        const updatedPreferences = await this.userPreferencesService.addFavoriteIngredient(
            req.user.userId,
            ingredient,
        );

        return new ResponseDto(
            HttpStatus.OK,
            'Ingredient added to favorites successfully',
            updatedPreferences.toJSON(),
        );
    }

    /**
     * Add disliked ingredient
     */
    @Post('ingredients/dislikes/:ingredient')
    @ApiOperation({
        summary: 'Add disliked ingredient',
        description: 'Add an ingredient to user dislikes',
    })
    @ApiParam({ name: 'ingredient', description: 'Ingredient name' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Ingredient added to dislikes successfully',
    })
    async addDislikedIngredient(
        @Request() req: any,
        @Param('ingredient') ingredient: string,
    ): Promise<ResponseDto<any>> {
        this.logger.log(`Adding disliked ingredient for user: ${req.user.userId}`);

        const updatedPreferences = await this.userPreferencesService.addDislikedIngredient(
            req.user.userId,
            ingredient,
        );

        return new ResponseDto(
            HttpStatus.OK,
            'Ingredient added to dislikes successfully',
            updatedPreferences.toJSON(),
        );
    }

    /**
     * Remove ingredient preference
     */
    @Delete('ingredients/:ingredient')
    @ApiOperation({
        summary: 'Remove ingredient preference',
        description: 'Remove an ingredient from both favorites and dislikes',
    })
    @ApiParam({ name: 'ingredient', description: 'Ingredient name' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Ingredient preference removed successfully',
    })
    async removeIngredientPreference(
        @Request() req: any,
        @Param('ingredient') ingredient: string,
    ): Promise<ResponseDto<any>> {
        this.logger.log(`Removing ingredient preference for user: ${req.user.userId}`);

        const updatedPreferences = await this.userPreferencesService.removeIngredientPreference(
            req.user.userId,
            ingredient,
        );

        return new ResponseDto(
            HttpStatus.OK,
            'Ingredient preference removed successfully',
            updatedPreferences.toJSON(),
        );
    }

    /**
     * Delete all user preferences
     */
    @Delete()
    @ApiOperation({
        summary: 'Delete user preferences',
        description: 'Delete all user preferences (for account deletion)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User preferences deleted successfully',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User preferences not found',
    })
    async deletePreferences(@Request() req: any): Promise<ResponseDto<null>> {
        this.logger.log(`Deleting preferences for user: ${req.user.userId}`);

        await this.userPreferencesService.deletePreferences(req.user.userId);

        return new ResponseDto(
            HttpStatus.OK,
            'User preferences deleted successfully',
            null,
        );
    }
} 