import {
    Controller,
    Get,
    Param,
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
    ApiParam,
    ApiQuery,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { NutritionService } from './nutrition.service';
import {
    DailyNutritionDto,
    WeeklyNutritionDto,
    MonthlyNutritionDto,
    NutritionTrendsDto,
    NutritionGoalsProgressDto,
} from './dto/nutrition-analysis.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Nutrition Analysis')
@Controller('nutrition')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NutritionController {
    private readonly logger = new Logger(NutritionController.name);

    constructor(private readonly nutritionService: NutritionService) { }

    @Get('daily/:date')
    @ApiOperation({
        summary: 'Get daily nutrition analysis',
        description: 'Retrieve comprehensive nutrition analysis for a specific date',
    })
    @ApiParam({
        name: 'date',
        description: 'Date in YYYY-MM-DD format',
        example: '2024-01-27',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Daily nutrition analysis retrieved successfully',
        type: DailyNutritionDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid date format',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async getDailyNutrition(
        @Request() req: any,
        @Param('date') date: string,
    ): Promise<{
        statusCode: number;
        message: string;
        data: DailyNutritionDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Getting daily nutrition for user ${userId} on ${date}`);

        const data = await this.nutritionService.getDailyNutrition(userId, date);

        return {
            statusCode: HttpStatus.OK,
            message: 'Daily nutrition analysis retrieved successfully',
            data,
        };
    }

    @Get('weekly/:startDate')
    @ApiOperation({
        summary: 'Get weekly nutrition trends',
        description: 'Retrieve weekly nutrition analysis starting from a specific date',
    })
    @ApiParam({
        name: 'startDate',
        description: 'Week start date in YYYY-MM-DD format',
        example: '2024-01-21',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Weekly nutrition analysis retrieved successfully',
        type: WeeklyNutritionDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid date format',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async getWeeklyNutrition(
        @Request() req: any,
        @Param('startDate') startDate: string,
    ): Promise<{
        statusCode: number;
        message: string;
        data: WeeklyNutritionDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Getting weekly nutrition for user ${userId} starting ${startDate}`);

        const data = await this.nutritionService.getWeeklyNutrition(userId, startDate);

        return {
            statusCode: HttpStatus.OK,
            message: 'Weekly nutrition analysis retrieved successfully',
            data,
        };
    }

    @Get('monthly/:year/:month')
    @ApiOperation({
        summary: 'Get monthly nutrition statistics',
        description: 'Retrieve comprehensive monthly nutrition statistics',
    })
    @ApiParam({
        name: 'year',
        description: 'Year (YYYY)',
        example: 2024,
    })
    @ApiParam({
        name: 'month',
        description: 'Month (1-12)',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Monthly nutrition statistics retrieved successfully',
        type: MonthlyNutritionDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid year or month',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async getMonthlyNutrition(
        @Request() req: any,
        @Param('year') year: number,
        @Param('month') month: number,
    ): Promise<{
        statusCode: number;
        message: string;
        data: MonthlyNutritionDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Getting monthly nutrition for user ${userId} for ${year}-${month}`);

        const data = await this.nutritionService.getMonthlyNutrition(userId, year, month);

        return {
            statusCode: HttpStatus.OK,
            message: 'Monthly nutrition statistics retrieved successfully',
            data,
        };
    }

    @Get('trends')
    @ApiOperation({
        summary: 'Get nutrition trends analysis',
        description: 'Retrieve nutrition trends over time with analysis',
    })
    @ApiQuery({
        name: 'period',
        description: 'Time period for trends',
        enum: ['weekly', 'monthly', 'yearly'],
        example: 'monthly',
    })
    @ApiQuery({
        name: 'periods',
        description: 'Number of periods to analyze',
        example: 12,
        required: false,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Nutrition trends retrieved successfully',
        type: NutritionTrendsDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid query parameters',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async getNutritionTrends(
        @Request() req: any,
        @Query('period') period: 'weekly' | 'monthly' | 'yearly' = 'monthly',
        @Query('periods') periods: number = 12,
    ): Promise<{
        statusCode: number;
        message: string;
        data: NutritionTrendsDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Getting nutrition trends for user ${userId} - ${period} for ${periods} periods`);

        const data = await this.nutritionService.getNutritionTrends(userId, period, periods);

        return {
            statusCode: HttpStatus.OK,
            message: 'Nutrition trends retrieved successfully',
            data,
        };
    }

    @Get('goals/progress')
    @ApiOperation({
        summary: 'Get nutrition goals progress',
        description: 'Retrieve current progress towards nutrition goals',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Nutrition goals progress retrieved successfully',
        type: NutritionGoalsProgressDto,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async getNutritionGoalsProgress(
        @Request() req: any,
    ): Promise<{
        statusCode: number;
        message: string;
        data: NutritionGoalsProgressDto;
    }> {
        const userId = req.user.id;
        this.logger.log(`Getting nutrition goals progress for user ${userId}`);

        const data = await this.nutritionService.getNutritionGoalsProgress(userId);

        return {
            statusCode: HttpStatus.OK,
            message: 'Nutrition goals progress retrieved successfully',
            data,
        };
    }
} 