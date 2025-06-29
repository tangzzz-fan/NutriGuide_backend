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
import { FoodLogsService } from './food-logs.service';
import { CreateFoodLogDto } from './dto/create-food-log.dto';
import { UpdateFoodLogDto } from './dto/update-food-log.dto';
import { FoodLogQueryDto } from './dto/food-log-query.dto';
import { FoodLogResponseDto, FoodLogListResponseDto } from './dto/food-log-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Food Logs')
@Controller('food-logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FoodLogsController {
    private readonly logger = new Logger(FoodLogsController.name);

    constructor(private readonly foodLogsService: FoodLogsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new food log entry',
        description: 'Creates a new food log entry with automatic nutrition calculation',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Food log created successfully',
        type: FoodLogResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Food not found',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async create(
        @Request() req: any,
        @Body() createFoodLogDto: CreateFoodLogDto,
    ): Promise<{
        statusCode: number;
        message: string;
        data: FoodLogResponseDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Creating food log for user ${userId}`);

        const foodLog = await this.foodLogsService.create(userId, createFoodLogDto);

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Food log created successfully',
            data: foodLog as any,
        };
    }

    @Get()
    @ApiOperation({
        summary: 'Get food logs with filtering and pagination',
        description: 'Retrieve user food logs with advanced filtering and pagination',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Food logs retrieved successfully',
        type: FoodLogListResponseDto,
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
        @Query() query: FoodLogQueryDto,
    ): Promise<{
        statusCode: number;
        message: string;
        data: FoodLogListResponseDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Querying food logs for user ${userId} with filters: ${JSON.stringify(query)}`);

        const result = await this.foodLogsService.findAll(userId, query);

        return {
            statusCode: HttpStatus.OK,
            message: 'Food logs retrieved successfully',
            data: result,
        };
    }

    @Get('daily/:date')
    @ApiOperation({
        summary: 'Get daily food logs',
        description: 'Retrieve all food logs for a specific date',
    })
    @ApiParam({
        name: 'date',
        description: 'Date in YYYY-MM-DD format',
        example: '2024-01-27',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Daily food logs retrieved successfully',
        type: [FoodLogResponseDto],
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid date format',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async findDailyLogs(
        @Request() req: any,
        @Param('date') date: string,
    ): Promise<{
        statusCode: number;
        message: string;
        data: FoodLogResponseDto[];
    }> {
        const userId = req.user.id;
        this.logger.log(`Getting daily food logs for user ${userId} on ${date}`);

        const logs = await this.foodLogsService.findDailyLogs(userId, date);

        return {
            statusCode: HttpStatus.OK,
            message: 'Daily food logs retrieved successfully',
            data: logs as any,
        };
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get a specific food log',
        description: 'Retrieve a specific food log by ID',
    })
    @ApiParam({
        name: 'id',
        description: 'Food log ID',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Food log retrieved successfully',
        type: FoodLogResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Food log not found',
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
        data: FoodLogResponseDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Getting food log ${id} for user ${userId}`);

        const foodLog = await this.foodLogsService.findOne(userId, id);

        return {
            statusCode: HttpStatus.OK,
            message: 'Food log retrieved successfully',
            data: foodLog as any,
        };
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update a food log',
        description: 'Update a specific food log with automatic nutrition recalculation',
    })
    @ApiParam({
        name: 'id',
        description: 'Food log ID',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Food log updated successfully',
        type: FoodLogResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Food log not found',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async update(
        @Request() req: any,
        @Param('id') id: string,
        @Body() updateFoodLogDto: UpdateFoodLogDto,
    ): Promise<{
        statusCode: number;
        message: string;
        data: FoodLogResponseDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Updating food log ${id} for user ${userId}`);

        const updatedLog = await this.foodLogsService.update(userId, id, updateFoodLogDto);

        return {
            statusCode: HttpStatus.OK,
            message: 'Food log updated successfully',
            data: updatedLog as any,
        };
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Delete a food log',
        description: 'Soft delete a specific food log',
    })
    @ApiParam({
        name: 'id',
        description: 'Food log ID',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Food log deleted successfully',
        type: FoodLogResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Food log not found',
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
        data: FoodLogResponseDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Deleting food log ${id} for user ${userId}`);

        const deletedLog = await this.foodLogsService.remove(userId, id);

        return {
            statusCode: HttpStatus.OK,
            message: 'Food log deleted successfully',
            data: deletedLog as any,
        };
    }

    @Post(':id/copy')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Copy food log to another date',
        description: 'Create a copy of an existing food log for a different date',
    })
    @ApiParam({
        name: 'id',
        description: 'Food log ID to copy',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Food log copied successfully',
        type: FoodLogResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Food log not found',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async copyToDate(
        @Request() req: any,
        @Param('id') id: string,
        @Body('targetDate') targetDate: string,
    ): Promise<{
        statusCode: number;
        message: string;
        data: FoodLogResponseDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Copying food log ${id} to ${targetDate} for user ${userId}`);

        const copiedLog = await this.foodLogsService.copyToDate(userId, id, targetDate);

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Food log copied successfully',
            data: copiedLog as any,
        };
    }
} 