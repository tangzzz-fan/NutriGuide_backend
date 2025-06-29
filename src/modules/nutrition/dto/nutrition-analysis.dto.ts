import { ApiProperty } from '@nestjs/swagger';

export class DailyNutritionDto {
    @ApiProperty({ description: 'Date', example: '2024-01-27' })
    date: string;

    @ApiProperty({ description: 'Total calories consumed (kcal)', example: 1850 })
    totalCalories: number;

    @ApiProperty({ description: 'Total protein consumed (grams)', example: 75.5 })
    totalProtein: number;

    @ApiProperty({ description: 'Total carbohydrates consumed (grams)', example: 220.3 })
    totalCarbohydrates: number;

    @ApiProperty({ description: 'Total fat consumed (grams)', example: 65.2 })
    totalFat: number;

    @ApiProperty({ description: 'Total fiber consumed (grams)', example: 25.8, required: false })
    totalFiber?: number;

    @ApiProperty({ description: 'Total sugar consumed (grams)', example: 85.2, required: false })
    totalSugar?: number;

    @ApiProperty({ description: 'Total sodium consumed (mg)', example: 2100, required: false })
    totalSodium?: number;

    @ApiProperty({ description: 'Breakdown by meal type' })
    mealBreakdown: {
        breakfast: NutritionSummaryDto;
        lunch: NutritionSummaryDto;
        dinner: NutritionSummaryDto;
        snack: NutritionSummaryDto;
    };

    @ApiProperty({ description: 'Number of food entries', example: 8 })
    foodEntryCount: number;
}

export class NutritionSummaryDto {
    @ApiProperty({ description: 'Calories (kcal)', example: 450 })
    calories: number;

    @ApiProperty({ description: 'Protein (grams)', example: 18.5 })
    protein: number;

    @ApiProperty({ description: 'Carbohydrates (grams)', example: 55.3 })
    carbohydrates: number;

    @ApiProperty({ description: 'Fat (grams)', example: 15.2 })
    fat: number;

    @ApiProperty({ description: 'Fiber (grams)', example: 8.8, required: false })
    fiber?: number;

    @ApiProperty({ description: 'Sugar (grams)', example: 20.2, required: false })
    sugar?: number;
}

export class WeeklyNutritionDto {
    @ApiProperty({ description: 'Start date of the week', example: '2024-01-21' })
    startDate: string;

    @ApiProperty({ description: 'End date of the week', example: '2024-01-27' })
    endDate: string;

    @ApiProperty({ description: 'Daily nutrition data for 7 days', type: [DailyNutritionDto] })
    dailyData: DailyNutritionDto[];

    @ApiProperty({ description: 'Weekly averages' })
    weeklyAverages: NutritionSummaryDto;

    @ApiProperty({ description: 'Weekly totals' })
    weeklyTotals: NutritionSummaryDto;
}

export class MonthlyNutritionDto {
    @ApiProperty({ description: 'Year', example: 2024 })
    year: number;

    @ApiProperty({ description: 'Month (1-12)', example: 1 })
    month: number;

    @ApiProperty({ description: 'Daily nutrition data for the month', type: [DailyNutritionDto] })
    dailyData: DailyNutritionDto[];

    @ApiProperty({ description: 'Monthly averages' })
    monthlyAverages: NutritionSummaryDto;

    @ApiProperty({ description: 'Monthly totals' })
    monthlyTotals: NutritionSummaryDto;

    @ApiProperty({ description: 'Number of days with food logs', example: 28 })
    daysWithLogs: number;

    @ApiProperty({ description: 'Total number of days in month', example: 31 })
    totalDaysInMonth: number;
}

export class NutritionTrendsDto {
    @ApiProperty({ description: 'Period type', enum: ['weekly', 'monthly', 'yearly'] })
    period: string;

    @ApiProperty({ description: 'Trend data points' })
    trendData: {
        label: string;
        calories: number;
        protein: number;
        carbohydrates: number;
        fat: number;
        date: string;
    }[];

    @ApiProperty({ description: 'Trend analysis' })
    analysis: {
        caloriesTrend: 'increasing' | 'decreasing' | 'stable';
        proteinTrend: 'increasing' | 'decreasing' | 'stable';
        carbohydratesTrend: 'increasing' | 'decreasing' | 'stable';
        fatTrend: 'increasing' | 'decreasing' | 'stable';
    };
}

export class NutritionGoalsProgressDto {
    @ApiProperty({ description: 'Daily calorie goal', example: 2000 })
    dailyCalorieGoal: number;

    @ApiProperty({ description: 'Daily protein goal (grams)', example: 80 })
    dailyProteinGoal: number;

    @ApiProperty({ description: 'Daily carbohydrate goal (grams)', example: 250 })
    dailyCarbohydrateGoal: number;

    @ApiProperty({ description: 'Daily fat goal (grams)', example: 70 })
    dailyFatGoal: number;

    @ApiProperty({ description: 'Current progress for today' })
    todayProgress: {
        calories: { consumed: number; goal: number; percentage: number };
        protein: { consumed: number; goal: number; percentage: number };
        carbohydrates: { consumed: number; goal: number; percentage: number };
        fat: { consumed: number; goal: number; percentage: number };
    };

    @ApiProperty({ description: 'Weekly average progress' })
    weeklyProgress: {
        averageCalorieIntake: number;
        goalAchievementRate: number; // Percentage of days goals were met
        consistencyScore: number; // 0-100 based on how consistent intake is
    };
} 