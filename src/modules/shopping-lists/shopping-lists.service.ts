import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ShoppingList, ShoppingListDocument } from './schemas/shopping-list.schema';
import { CreateShoppingListDto, UpdateShoppingListDto, ShoppingListResponseDto } from './dto';

@Injectable()
export class ShoppingListsService {
    constructor(
        @InjectModel(ShoppingList.name) private shoppingListModel: Model<ShoppingListDocument>,
    ) { }

    /**
     * Create a new shopping list
     */
    async create(userId: string, createShoppingListDto: CreateShoppingListDto): Promise<ShoppingListResponseDto> {
        // Calculate total estimated cost
        let totalEstimatedCost = 0;
        if (createShoppingListDto.items.some(item => item.estimatedPrice)) {
            totalEstimatedCost = createShoppingListDto.items.reduce((sum, item) => {
                return sum + (item.estimatedPrice || 0) * item.totalQuantity;
            }, 0);
        }

        const shoppingList = new this.shoppingListModel({
            userId: new Types.ObjectId(userId),
            planId: new Types.ObjectId(createShoppingListDto.planId),
            items: createShoppingListDto.items.map(item => ({
                ...item,
                foodId: new Types.ObjectId(item.foodId),
                isPurchased: item.isPurchased || false,
            })),
            totalEstimatedCost: totalEstimatedCost > 0 ? totalEstimatedCost : undefined,
            notes: createShoppingListDto.notes,
            status: 'pending',
        });

        const savedShoppingList = await shoppingList.save();
        return this.mapToResponseDto(savedShoppingList);
    }

    /**
     * Generate shopping list from meal plan
     */
    async generateFromMealPlan(userId: string, planId: string): Promise<ShoppingListResponseDto> {
        // Check if shopping list already exists for this plan
        const existingList = await this.shoppingListModel.findOne({
            userId: new Types.ObjectId(userId),
            planId: new Types.ObjectId(planId),
        });

        if (existingList) {
            return this.mapToResponseDto(existingList);
        }

        // TODO: In real implementation, fetch meal plan and aggregate ingredients
        // For now, create a mock shopping list based on planId
        const mockItems = [
            {
                foodId: new Types.ObjectId(),
                name: '西兰花',
                totalQuantity: 500,
                unit: 'g',
                isPurchased: false,
                estimatedPrice: 8.5,
            },
            {
                foodId: new Types.ObjectId(),
                name: '鸡胸肉',
                totalQuantity: 300,
                unit: 'g',
                isPurchased: false,
                estimatedPrice: 15.2,
            },
            {
                foodId: new Types.ObjectId(),
                name: '大米',
                totalQuantity: 1000,
                unit: 'g',
                isPurchased: false,
                estimatedPrice: 6.8,
            },
        ];

        const totalEstimatedCost = mockItems.reduce((sum, item) => {
            return sum + (item.estimatedPrice || 0);
        }, 0);

        const shoppingList = new this.shoppingListModel({
            userId: new Types.ObjectId(userId),
            planId: new Types.ObjectId(planId),
            items: mockItems,
            totalEstimatedCost,
            status: 'pending',
            notes: '基于膳食计划自动生成的购物清单',
        });

        const savedShoppingList = await shoppingList.save();
        return this.mapToResponseDto(savedShoppingList);
    }

    /**
     * Get shopping lists for a user
     */
    async findByUser(userId: string, status?: string): Promise<ShoppingListResponseDto[]> {
        const query: any = { userId: new Types.ObjectId(userId) };

        if (status) {
            query.status = status;
        }

        const shoppingLists = await this.shoppingListModel
            .find(query)
            .sort({ createdAt: -1 })
            .exec();

        return shoppingLists.map(list => this.mapToResponseDto(list));
    }

    /**
     * Get shopping list by ID
     */
    async findOne(id: string, userId: string): Promise<ShoppingListResponseDto> {
        const shoppingList = await this.shoppingListModel.findById(id).exec();

        if (!shoppingList) {
            throw new NotFoundException('Shopping list not found');
        }

        // Check ownership
        if (shoppingList.userId.toString() !== userId) {
            throw new ForbiddenException('Access denied to this shopping list');
        }

        return this.mapToResponseDto(shoppingList);
    }

    /**
     * Update shopping list
     */
    async update(id: string, userId: string, updateShoppingListDto: UpdateShoppingListDto): Promise<ShoppingListResponseDto> {
        const shoppingList = await this.shoppingListModel.findById(id).exec();

        if (!shoppingList) {
            throw new NotFoundException('Shopping list not found');
        }

        // Check ownership
        if (shoppingList.userId.toString() !== userId) {
            throw new ForbiddenException('Access denied to this shopping list');
        }

        // Update items if provided
        if (updateShoppingListDto.items) {
            shoppingList.items = updateShoppingListDto.items.map(item => ({
                ...item,
                foodId: item.foodId ? new Types.ObjectId(item.foodId) : undefined,
            })) as any;

            // Recalculate total estimated cost
            const totalEstimatedCost = shoppingList.items.reduce((sum, item) => {
                return sum + (item.estimatedPrice || 0) * item.totalQuantity;
            }, 0);
            shoppingList.totalEstimatedCost = totalEstimatedCost > 0 ? totalEstimatedCost : undefined;
        }

        // Update status if provided
        if (updateShoppingListDto.status) {
            shoppingList.status = updateShoppingListDto.status;
        }

        // Update notes if provided
        if (updateShoppingListDto.notes !== undefined) {
            shoppingList.notes = updateShoppingListDto.notes;
        }

        const updatedShoppingList = await shoppingList.save();
        return this.mapToResponseDto(updatedShoppingList);
    }

    /**
     * Delete shopping list
     */
    async remove(id: string, userId: string): Promise<void> {
        const shoppingList = await this.shoppingListModel.findById(id).exec();

        if (!shoppingList) {
            throw new NotFoundException('Shopping list not found');
        }

        // Check ownership
        if (shoppingList.userId.toString() !== userId) {
            throw new ForbiddenException('Access denied to this shopping list');
        }

        await this.shoppingListModel.findByIdAndDelete(id).exec();
    }

    /**
     * Mark item as purchased/unpurchased
     */
    async toggleItemPurchased(listId: string, userId: string, foodId: string, isPurchased: boolean): Promise<ShoppingListResponseDto> {
        const shoppingList = await this.shoppingListModel.findById(listId).exec();

        if (!shoppingList) {
            throw new NotFoundException('Shopping list not found');
        }

        // Check ownership
        if (shoppingList.userId.toString() !== userId) {
            throw new ForbiddenException('Access denied to this shopping list');
        }

        // Find and update the item
        const item = shoppingList.items.find(item => item.foodId.toString() === foodId);
        if (!item) {
            throw new NotFoundException('Item not found in shopping list');
        }

        item.isPurchased = isPurchased;

        // Update status based on items completion
        const allPurchased = shoppingList.items.every(item => item.isPurchased);
        const anyPurchased = shoppingList.items.some(item => item.isPurchased);

        if (allPurchased) {
            shoppingList.status = 'completed';
        } else if (anyPurchased) {
            shoppingList.status = 'shopping';
        } else {
            shoppingList.status = 'pending';
        }

        const updatedShoppingList = await shoppingList.save();
        return this.mapToResponseDto(updatedShoppingList);
    }

    /**
     * Get shopping statistics for a user
     */
    async getStatistics(userId: string): Promise<any> {
        const stats = await this.shoppingListModel.aggregate([
            { $match: { userId: new Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalCost: { $sum: '$totalEstimatedCost' },
                }
            }
        ]);

        const totalLists = await this.shoppingListModel.countDocuments({ userId: new Types.ObjectId(userId) });

        return {
            totalLists,
            byStatus: stats.reduce((acc, stat) => {
                acc[stat._id] = {
                    count: stat.count,
                    totalCost: stat.totalCost || 0,
                };
                return acc;
            }, {}),
        };
    }

    /**
     * Map document to response DTO
     */
    private mapToResponseDto(doc: ShoppingListDocument): ShoppingListResponseDto {
        return {
            id: doc._id.toString(),
            userId: doc.userId.toString(),
            planId: doc.planId.toString(),
            items: doc.items.map(item => ({
                foodId: item.foodId.toString(),
                name: item.name,
                totalQuantity: item.totalQuantity,
                unit: item.unit,
                isPurchased: item.isPurchased,
                estimatedPrice: item.estimatedPrice,
                notes: item.notes,
            })),
            totalEstimatedCost: doc.totalEstimatedCost,
            status: doc.status,
            notes: doc.notes,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }
}