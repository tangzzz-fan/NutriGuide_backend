import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FoodLog, FoodLogDocument } from '../food-logs/schemas/food-log.schema';
import {
    DailyNutritionDto,
    WeeklyNutritionDto,
    MonthlyNutritionDto,
    NutritionTrendsDto,
    NutritionGoalsProgressDto,
    NutritionSummaryDto,
} from './dto/nutrition-analysis.dto';

@Injectable()
export class NutritionService {
    private readonly logger = new Logger(NutritionService.name);

    constructor(
        @InjectModel(FoodLog.name)
        private readonly foodLogModel: Model<FoodLogDocument>,
    ) { }

    async getDailyNutrition(userId: string, date: string): Promise<DailyNutritionDto> {
        this.logger.log(`Getting daily nutrition for user ${userId} on ${date}`);

        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const logs = await this.foodLogModel
            .find({
                userId: new Types.ObjectId(userId),
                consumedAt: { $gte: startDate, $lte: endDate },
                isActive: true,
            })
            .exec();

        const mealBreakdown = {
            breakfast: this.calculateNutritionSummary(logs.filter(log => log.mealType === 'breakfast')),
            lunch: this.calculateNutritionSummary(logs.filter(log => log.mealType === 'lunch')),
            dinner: this.calculateNutritionSummary(logs.filter(log => log.mealType === 'dinner')),
            snack: this.calculateNutritionSummary(logs.filter(log => log.mealType === 'snack')),
        };

        const totalNutrition = this.calculateNutritionSummary(logs);

        return {
            date,
            totalCalories: totalNutrition.calories,
            totalProtein: totalNutrition.protein,
            totalCarbohydrates: totalNutrition.carbohydrates,
            totalFat: totalNutrition.fat,
            totalFiber: totalNutrition.fiber,
            totalSugar: totalNutrition.sugar,
            totalSodium: this.sumOptionalField(logs, 'sodium'),
            mealBreakdown,
            foodEntryCount: logs.length,
        };
    }

    async getWeeklyNutrition(userId: string, startDate: string): Promise<WeeklyNutritionDto> {
        this.logger.log(`Getting weekly nutrition for user ${userId} starting ${startDate}`);

        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        const dailyData: DailyNutritionDto[] = [];
        const allLogs: FoodLogDocument[] = [];

        // Get data for each day of the week
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(start);
            currentDate.setDate(start.getDate() + i);
            const dateString = currentDate.toISOString().split('T')[0];

            const dayData = await this.getDailyNutrition(userId, dateString);
            dailyData.push(dayData);

            // Collect all logs for weekly calculations
            const dayLogs = await this.foodLogModel
                .find({
                    userId: new Types.ObjectId(userId),
                    consumedAt: {
                        $gte: new Date(dateString + 'T00:00:00.000Z'),
                        $lte: new Date(dateString + 'T23:59:59.999Z'),
                    },
                    isActive: true,
                })
                .exec();
            allLogs.push(...dayLogs);
        }

        const weeklyTotals = this.calculateNutritionSummary(allLogs);
        const weeklyAverages = {
            calories: Math.round(weeklyTotals.calories / 7),
            protein: Math.round((weeklyTotals.protein / 7) * 10) / 10,
            carbohydrates: Math.round((weeklyTotals.carbohydrates / 7) * 10) / 10,
            fat: Math.round((weeklyTotals.fat / 7) * 10) / 10,
            fiber: weeklyTotals.fiber ? Math.round((weeklyTotals.fiber / 7) * 10) / 10 : 0,
            sugar: weeklyTotals.sugar ? Math.round((weeklyTotals.sugar / 7) * 10) / 10 : 0,
        };

        return {
            startDate,
            endDate: end.toISOString().split('T')[0],
            dailyData,
            weeklyAverages,
            weeklyTotals,
        };
    }

    async getMonthlyNutrition(userId: string, year: number, month: number): Promise<MonthlyNutritionDto> {
        this.logger.log(`Getting monthly nutrition for user ${userId} for ${year}-${month}`);

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of the month

        const dailyData: DailyNutritionDto[] = [];
        const allLogs: FoodLogDocument[] = [];

        // Get data for each day of the month
        for (let day = 1; day <= endDate.getDate(); day++) {
            const currentDate = new Date(year, month - 1, day);
            const dateString = currentDate.toISOString().split('T')[0];

            const dayData = await this.getDailyNutrition(userId, dateString);
            dailyData.push(dayData);

            // Collect all logs for monthly calculations
            const dayLogs = await this.foodLogModel
                .find({
                    userId: new Types.ObjectId(userId),
                    consumedAt: {
                        $gte: new Date(dateString + 'T00:00:00.000Z'),
                        $lte: new Date(dateString + 'T23:59:59.999Z'),
                    },
                    isActive: true,
                })
                .exec();
            allLogs.push(...dayLogs);
        }

        const monthlyTotals = this.calculateNutritionSummary(allLogs);
        const daysWithLogs = dailyData.filter(day => day.foodEntryCount > 0).length;
        const totalDaysInMonth = endDate.getDate();

        const monthlyAverages = {
            calories: Math.round(monthlyTotals.calories / totalDaysInMonth),
            protein: Math.round((monthlyTotals.protein / totalDaysInMonth) * 10) / 10,
            carbohydrates: Math.round((monthlyTotals.carbohydrates / totalDaysInMonth) * 10) / 10,
            fat: Math.round((monthlyTotals.fat / totalDaysInMonth) * 10) / 10,
            fiber: monthlyTotals.fiber ? Math.round((monthlyTotals.fiber / totalDaysInMonth) * 10) / 10 : 0,
            sugar: monthlyTotals.sugar ? Math.round((monthlyTotals.sugar / totalDaysInMonth) * 10) / 10 : 0,
        };

        return {
            year,
            month,
            dailyData,
            monthlyAverages,
            monthlyTotals,
            daysWithLogs,
            totalDaysInMonth,
        };
    }

    async getNutritionTrends(
        userId: string,
        period: 'weekly' | 'monthly' | 'yearly',
        periods: number = 12,
    ): Promise<NutritionTrendsDto> {
        this.logger.log(`Getting nutrition trends for user ${userId} - ${period} for ${periods} periods`);

        const trendData: any[] = [];
        const now = new Date();

        for (let i = periods - 1; i >= 0; i--) {
            let periodData: NutritionSummaryDto;
            let label: string;
            let date: string;

            if (period === 'weekly') {
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - (i * 7));
                weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
                date = weekStart.toISOString().split('T')[0];

                const weekData = await this.getWeeklyNutrition(userId, date);
                periodData = weekData.weeklyAverages;
                label = `Week of ${date}`;
            } else if (period === 'monthly') {
                const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthData = await this.getMonthlyNutrition(userId, monthDate.getFullYear(), monthDate.getMonth() + 1);
                periodData = monthData.monthlyAverages;
                label = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
                date = monthDate.toISOString().split('T')[0];
            } else {
                // Yearly - calculate based on monthly data
                const year = now.getFullYear() - i;
                const yearData = await this.getYearlyAverages(userId, year);
                periodData = yearData;
                label = String(year);
                date = `${year}-01-01`;
            }

            trendData.push({
                label,
                calories: periodData.calories,
                protein: periodData.protein,
                carbohydrates: periodData.carbohydrates,
                fat: periodData.fat,
                date,
            });
        }

        const analysis = this.analyzeTrends(trendData);

        return {
            period,
            trendData,
            analysis,
        };
    }

    async getNutritionGoalsProgress(userId: string): Promise<NutritionGoalsProgressDto> {
        this.logger.log(`Getting nutrition goals progress for user ${userId}`);

        // Default goals - in a real app, these would come from user settings
        const goals = {
            dailyCalorieGoal: 2000,
            dailyProteinGoal: 80,
            dailyCarbohydrateGoal: 250,
            dailyFatGoal: 70,
        };

        const today = new Date().toISOString().split('T')[0];
        const todayData = await this.getDailyNutrition(userId, today);

        const todayProgress = {
            calories: {
                consumed: todayData.totalCalories,
                goal: goals.dailyCalorieGoal,
                percentage: Math.round((todayData.totalCalories / goals.dailyCalorieGoal) * 100),
            },
            protein: {
                consumed: todayData.totalProtein,
                goal: goals.dailyProteinGoal,
                percentage: Math.round((todayData.totalProtein / goals.dailyProteinGoal) * 100),
            },
            carbohydrates: {
                consumed: todayData.totalCarbohydrates,
                goal: goals.dailyCarbohydrateGoal,
                percentage: Math.round((todayData.totalCarbohydrates / goals.dailyCarbohydrateGoal) * 100),
            },
            fat: {
                consumed: todayData.totalFat,
                goal: goals.dailyFatGoal,
                percentage: Math.round((todayData.totalFat / goals.dailyFatGoal) * 100),
            },
        };

        // Calculate weekly progress
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekData = await this.getWeeklyNutrition(userId, weekStart.toISOString().split('T')[0]);

        const weeklyProgress = {
            averageCalorieIntake: weekData.weeklyAverages.calories,
            goalAchievementRate: this.calculateGoalAchievementRate(weekData.dailyData, goals),
            consistencyScore: this.calculateConsistencyScore(weekData.dailyData),
        };

        return {
            ...goals,
            todayProgress,
            weeklyProgress,
        };
    }

    private calculateNutritionSummary(logs: FoodLogDocument[]): NutritionSummaryDto {
        if (logs.length === 0) {
            return { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0 };
        }

        const totals = logs.reduce(
            (acc, log) => {
                acc.calories += log.nutrition.calories || 0;
                acc.protein += log.nutrition.protein || 0;
                acc.carbohydrates += log.nutrition.carbohydrates || 0;
                acc.fat += log.nutrition.fat || 0;
                acc.fiber += log.nutrition.fiber || 0;
                acc.sugar += log.nutrition.sugar || 0;
                return acc;
            },
            { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0 },
        );

        return {
            calories: Math.round(totals.calories),
            protein: Math.round(totals.protein * 10) / 10,
            carbohydrates: Math.round(totals.carbohydrates * 10) / 10,
            fat: Math.round(totals.fat * 10) / 10,
            fiber: Math.round(totals.fiber * 10) / 10,
            sugar: Math.round(totals.sugar * 10) / 10,
        };
    }

    private sumOptionalField(logs: FoodLogDocument[], field: string): number | undefined {
        const total = logs.reduce((acc, log) => {
            const value = log.nutrition[field];
            return acc + (value || 0);
        }, 0);
        return total > 0 ? Math.round(total * 10) / 10 : undefined;
    }

    private async getYearlyAverages(userId: string, year: number): Promise<NutritionSummaryDto> {
        const yearlyTotals = { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0 };
        let monthsWithData = 0;

        for (let month = 1; month <= 12; month++) {
            const monthData = await this.getMonthlyNutrition(userId, year, month);
            if (monthData.daysWithLogs > 0) {
                yearlyTotals.calories += monthData.monthlyAverages.calories;
                yearlyTotals.protein += monthData.monthlyAverages.protein;
                yearlyTotals.carbohydrates += monthData.monthlyAverages.carbohydrates;
                yearlyTotals.fat += monthData.monthlyAverages.fat;
                yearlyTotals.fiber += monthData.monthlyAverages.fiber || 0;
                yearlyTotals.sugar += monthData.monthlyAverages.sugar || 0;
                monthsWithData++;
            }
        }

        return {
            calories: monthsWithData > 0 ? Math.round(yearlyTotals.calories / monthsWithData) : 0,
            protein: monthsWithData > 0 ? Math.round((yearlyTotals.protein / monthsWithData) * 10) / 10 : 0,
            carbohydrates: monthsWithData > 0 ? Math.round((yearlyTotals.carbohydrates / monthsWithData) * 10) / 10 : 0,
            fat: monthsWithData > 0 ? Math.round((yearlyTotals.fat / monthsWithData) * 10) / 10 : 0,
            fiber: monthsWithData > 0 ? Math.round((yearlyTotals.fiber / monthsWithData) * 10) / 10 : 0,
            sugar: monthsWithData > 0 ? Math.round((yearlyTotals.sugar / monthsWithData) * 10) / 10 : 0,
        };
    }

    private analyzeTrends(data: any[]): any {
        if (data.length < 2) {
            return {
                caloriesTrend: 'stable',
                proteinTrend: 'stable',
                carbohydratesTrend: 'stable',
                fatTrend: 'stable',
            };
        }

        const first = data[0];
        const last = data[data.length - 1];

        return {
            caloriesTrend: this.getTrendDirection(first.calories, last.calories),
            proteinTrend: this.getTrendDirection(first.protein, last.protein),
            carbohydratesTrend: this.getTrendDirection(first.carbohydrates, last.carbohydrates),
            fatTrend: this.getTrendDirection(first.fat, last.fat),
        };
    }

    private getTrendDirection(start: number, end: number): 'increasing' | 'decreasing' | 'stable' {
        const change = ((end - start) / start) * 100;
        if (change > 5) return 'increasing';
        if (change < -5) return 'decreasing';
        return 'stable';
    }

    private calculateGoalAchievementRate(dailyData: DailyNutritionDto[], goals: any): number {
        const achievedDays = dailyData.filter(day => {
            const calorieGoalMet = Math.abs(day.totalCalories - goals.dailyCalorieGoal) <= (goals.dailyCalorieGoal * 0.1);
            return calorieGoalMet;
        }).length;

        return Math.round((achievedDays / dailyData.length) * 100);
    }

    private calculateConsistencyScore(dailyData: DailyNutritionDto[]): number {
        if (dailyData.length === 0) return 0;

        const calories = dailyData.map(day => day.totalCalories);
        const average = calories.reduce((sum, cal) => sum + cal, 0) / calories.length;
        const variance = calories.reduce((sum, cal) => sum + Math.pow(cal - average, 2), 0) / calories.length;
        const standardDeviation = Math.sqrt(variance);

        // Convert to consistency score (lower deviation = higher consistency)
        const coefficientOfVariation = standardDeviation / average;
        const consistencyScore = Math.max(0, 100 - (coefficientOfVariation * 100));

        return Math.round(consistencyScore);
    }
} 