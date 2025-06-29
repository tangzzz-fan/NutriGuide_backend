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
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeQueryDto } from './dto/recipe-query.dto';
import {
    RecipeResponseDto,
    RecipeListResponseDto,
} from './dto/recipe-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Recipes')
@Controller('recipes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RecipesController {
    private readonly logger = new Logger(RecipesController.name);

    constructor(private readonly recipesService: RecipesService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new recipe',
        description: 'Creates a new recipe with ingredients and cooking steps',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Recipe created successfully',
        type: RecipeResponseDto,
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
        @Body() createRecipeDto: CreateRecipeDto,
    ): Promise<{
        statusCode: number;
        message: string;
        data: RecipeResponseDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Creating recipe for user ${userId}: ${createRecipeDto.name}`);

        const recipe = await this.recipesService.create(userId, createRecipeDto);

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Recipe created successfully',
            data: recipe,
        };
    }

    @Get()
    @ApiOperation({
        summary: 'Get recipes with filtering and pagination',
        description: 'Retrieve recipes with advanced filtering and pagination options',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Recipes retrieved successfully',
        type: RecipeListResponseDto,
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
        @Query() query: RecipeQueryDto,
    ): Promise<{
        statusCode: number;
        message: string;
        data: RecipeListResponseDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Querying recipes for user ${userId} with filters: ${JSON.stringify(query)}`);

        const result = await this.recipesService.findAll(userId, query);

        return {
            statusCode: HttpStatus.OK,
            message: 'Recipes retrieved successfully',
            data: result,
        };
    }

    @Get('search')
    @ApiOperation({
        summary: 'Search recipes',
        description: 'Search recipes by name or description',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Recipe search results',
        type: RecipeListResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid search parameters',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async searchRecipes(
        @Request() req: any,
        @Query('q') searchTerm: string,
        @Query() query: RecipeQueryDto,
    ): Promise<{
        statusCode: number;
        message: string;
        data: RecipeListResponseDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Searching recipes for user ${userId} with term: ${searchTerm}`);

        const result = await this.recipesService.searchRecipes(userId, searchTerm, query);

        return {
            statusCode: HttpStatus.OK,
            message: 'Recipe search completed successfully',
            data: result,
        };
    }

    @Get('favorites')
    @ApiOperation({
        summary: 'Get favorite recipes',
        description: 'Retrieve user\'s favorite recipes',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Favorite recipes retrieved successfully',
        type: RecipeListResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async getFavorites(
        @Request() req: any,
        @Query() query: RecipeQueryDto,
    ): Promise<{
        statusCode: number;
        message: string;
        data: RecipeListResponseDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Getting favorite recipes for user ${userId}`);

        const result = await this.recipesService.getFavorites(userId, query);

        return {
            statusCode: HttpStatus.OK,
            message: 'Favorite recipes retrieved successfully',
            data: result,
        };
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get a specific recipe',
        description: 'Retrieve a specific recipe by ID',
    })
    @ApiParam({
        name: 'id',
        description: 'Recipe ID',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Recipe retrieved successfully',
        type: RecipeResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Recipe not found',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Access denied to this recipe',
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
        data: RecipeResponseDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Getting recipe ${id} for user ${userId}`);

        const recipe = await this.recipesService.findOne(userId, id);

        return {
            statusCode: HttpStatus.OK,
            message: 'Recipe retrieved successfully',
            data: recipe,
        };
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update a recipe',
        description: 'Update an existing recipe (only by recipe creator)',
    })
    @ApiParam({
        name: 'id',
        description: 'Recipe ID',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Recipe updated successfully',
        type: RecipeResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data or food items not found',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Recipe not found',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'You can only update your own recipes',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async update(
        @Request() req: any,
        @Param('id') id: string,
        @Body() updateRecipeDto: UpdateRecipeDto,
    ): Promise<{
        statusCode: number;
        message: string;
        data: RecipeResponseDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Updating recipe ${id} for user ${userId}`);

        const recipe = await this.recipesService.update(userId, id, updateRecipeDto);

        return {
            statusCode: HttpStatus.OK,
            message: 'Recipe updated successfully',
            data: recipe,
        };
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Delete a recipe',
        description: 'Delete a recipe (only by recipe creator)',
    })
    @ApiParam({
        name: 'id',
        description: 'Recipe ID',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Recipe deleted successfully',
        type: RecipeResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Recipe not found',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'You can only delete your own recipes',
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
        data: RecipeResponseDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Deleting recipe ${id} for user ${userId}`);

        const recipe = await this.recipesService.remove(userId, id);

        return {
            statusCode: HttpStatus.OK,
            message: 'Recipe deleted successfully',
            data: recipe,
        };
    }

    @Post(':id/favorite')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Toggle recipe favorite status',
        description: 'Add or remove recipe from user favorites',
    })
    @ApiParam({
        name: 'id',
        description: 'Recipe ID',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Favorite status toggled successfully',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 200 },
                message: { type: 'string', example: 'Favorite status toggled successfully' },
                data: {
                    type: 'object',
                    properties: {
                        isFavorited: { type: 'boolean', example: true },
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Recipe not found',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async toggleFavorite(
        @Request() req: any,
        @Param('id') id: string,
    ): Promise<{
        statusCode: number;
        message: string;
        data: { isFavorited: boolean };
    }> {
        const userId = req.user.id;
        this.logger.log(`Toggling favorite status for recipe ${id} by user ${userId}`);

        const result = await this.recipesService.toggleFavorite(userId, id);

        return {
            statusCode: HttpStatus.OK,
            message: 'Favorite status toggled successfully',
            data: result,
        };
    }
} 