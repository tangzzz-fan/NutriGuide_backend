import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    Query,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
    ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShoppingListsService } from './shopping-lists.service';
import {
    CreateShoppingListDto,
    UpdateShoppingListDto,
    ShoppingListResponseDto,
} from './dto';

@ApiTags('Shopping Lists')
@Controller('shopping-lists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ShoppingListsController {
    constructor(private readonly shoppingListsService: ShoppingListsService) { }

    @Post()
    @ApiOperation({
        summary: 'Create a new shopping list',
        description: 'Create a shopping list manually with specified items'
    })
    @ApiBody({ type: CreateShoppingListDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Shopping list created successfully',
        type: ShoppingListResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing JWT token',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad request - Invalid input data',
    })
    async create(
        @Request() req,
        @Body() createShoppingListDto: CreateShoppingListDto,
    ): Promise<{ statusCode: number; message: string; data: ShoppingListResponseDto }> {
        const shoppingList = await this.shoppingListsService.create(req.user.userId, createShoppingListDto);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Shopping list created successfully',
            data: shoppingList,
        };
    }

    @Post('generate/:planId')
    @ApiOperation({
        summary: 'Generate shopping list from meal plan',
        description: 'Automatically generate a shopping list based on a meal plan'
    })
    @ApiParam({ name: 'planId', description: 'Meal plan ID', example: '507f1f77bcf86cd799439012' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Shopping list generated successfully',
        type: ShoppingListResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Meal plan not found',
    })
    async generateFromMealPlan(
        @Request() req,
        @Param('planId') planId: string,
    ): Promise<{ statusCode: number; message: string; data: ShoppingListResponseDto }> {
        const shoppingList = await this.shoppingListsService.generateFromMealPlan(req.user.userId, planId);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Shopping list generated successfully',
            data: shoppingList,
        };
    }

    @Get()
    @ApiOperation({
        summary: 'Get user shopping lists',
        description: 'Retrieve all shopping lists for the authenticated user'
    })
    @ApiQuery({
        name: 'status',
        required: false,
        description: 'Filter by status',
        enum: ['pending', 'shopping', 'completed'],
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Shopping lists retrieved successfully',
        type: [ShoppingListResponseDto],
    })
    async findAll(
        @Request() req,
        @Query('status') status?: string,
    ): Promise<{ statusCode: number; message: string; data: ShoppingListResponseDto[] }> {
        const shoppingLists = await this.shoppingListsService.findByUser(req.user.userId, status);
        return {
            statusCode: HttpStatus.OK,
            message: 'Shopping lists retrieved successfully',
            data: shoppingLists,
        };
    }

    @Get('statistics')
    @ApiOperation({
        summary: 'Get shopping statistics',
        description: 'Get shopping list statistics for the authenticated user'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Shopping statistics retrieved successfully',
    })
    async getStatistics(
        @Request() req,
    ): Promise<{ statusCode: number; message: string; data: any }> {
        const statistics = await this.shoppingListsService.getStatistics(req.user.userId);
        return {
            statusCode: HttpStatus.OK,
            message: 'Shopping statistics retrieved successfully',
            data: statistics,
        };
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get shopping list by ID',
        description: 'Retrieve a specific shopping list by its ID'
    })
    @ApiParam({ name: 'id', description: 'Shopping list ID', example: '507f1f77bcf86cd799439013' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Shopping list retrieved successfully',
        type: ShoppingListResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Shopping list not found',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Access denied to this shopping list',
    })
    async findOne(
        @Request() req,
        @Param('id') id: string,
    ): Promise<{ statusCode: number; message: string; data: ShoppingListResponseDto }> {
        const shoppingList = await this.shoppingListsService.findOne(id, req.user.userId);
        return {
            statusCode: HttpStatus.OK,
            message: 'Shopping list retrieved successfully',
            data: shoppingList,
        };
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update shopping list',
        description: 'Update a shopping list (items, status, notes)'
    })
    @ApiParam({ name: 'id', description: 'Shopping list ID', example: '507f1f77bcf86cd799439013' })
    @ApiBody({ type: UpdateShoppingListDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Shopping list updated successfully',
        type: ShoppingListResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Shopping list not found',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Access denied to this shopping list',
    })
    async update(
        @Request() req,
        @Param('id') id: string,
        @Body() updateShoppingListDto: UpdateShoppingListDto,
    ): Promise<{ statusCode: number; message: string; data: ShoppingListResponseDto }> {
        const shoppingList = await this.shoppingListsService.update(id, req.user.userId, updateShoppingListDto);
        return {
            statusCode: HttpStatus.OK,
            message: 'Shopping list updated successfully',
            data: shoppingList,
        };
    }

    @Patch(':id/items/:foodId/toggle')
    @ApiOperation({
        summary: 'Toggle item purchase status',
        description: 'Mark an item as purchased or unpurchased'
    })
    @ApiParam({ name: 'id', description: 'Shopping list ID', example: '507f1f77bcf86cd799439013' })
    @ApiParam({ name: 'foodId', description: 'Food item ID', example: '507f1f77bcf86cd799439011' })
    @ApiBody({
        description: 'Purchase status',
        schema: {
            type: 'object',
            properties: {
                isPurchased: { type: 'boolean', example: true }
            },
            required: ['isPurchased']
        }
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Item purchase status updated successfully',
        type: ShoppingListResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Shopping list or item not found',
    })
    async toggleItemPurchased(
        @Request() req,
        @Param('id') id: string,
        @Param('foodId') foodId: string,
        @Body('isPurchased') isPurchased: boolean,
    ): Promise<{ statusCode: number; message: string; data: ShoppingListResponseDto }> {
        const shoppingList = await this.shoppingListsService.toggleItemPurchased(
            id,
            req.user.userId,
            foodId,
            isPurchased,
        );
        return {
            statusCode: HttpStatus.OK,
            message: 'Item purchase status updated successfully',
            data: shoppingList,
        };
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Delete shopping list',
        description: 'Delete a shopping list'
    })
    @ApiParam({ name: 'id', description: 'Shopping list ID', example: '507f1f77bcf86cd799439013' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Shopping list deleted successfully',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Shopping list not found',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Access denied to this shopping list',
    })
    async remove(
        @Request() req,
        @Param('id') id: string,
    ): Promise<{ statusCode: number; message: string }> {
        await this.shoppingListsService.remove(id, req.user.userId);
        return {
            statusCode: HttpStatus.OK,
            message: 'Shopping list deleted successfully',
        };
    }
}