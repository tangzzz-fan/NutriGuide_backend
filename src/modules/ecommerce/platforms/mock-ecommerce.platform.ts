import { Injectable } from '@nestjs/common';
import {
    EcommercePlatform,
    FoodSearchItem,
    PlatformProduct,
    SkuMapping,
    CreateOrderRequest,
    PlatformOrder,
    OrderStatus,
    DeliveryOption,
    AddressValidationResult,
} from '../interfaces/ecommerce-platform.interface';
import { DeliveryAddress } from '../dto/delivery-address.dto';

/**
 * Mock电商平台实现
 * 用于开发和测试阶段，提供模拟的电商平台功能
 */
@Injectable()
export class MockEcommercePlatform implements EcommercePlatform {
    readonly platformId = 'mock';
    readonly platformName = 'Mock电商平台';

    private mockSkuMappings: Map<string, SkuMapping> = new Map();
    private mockOrders: Map<string, PlatformOrder> = new Map();

    constructor() {
        this.initializeMockData();
    }

    /**
     * 初始化Mock数据
     */
    private initializeMockData(): void {
        // 预设一些SKU映射
        const mockMappings: SkuMapping[] = [
            {
                id: 'mapping_1',
                foodId: 'food_broccoli',
                platformId: this.platformId,
                skuId: 'mock_broccoli_500g',
                confidence: 0.95,
                lastUpdated: new Date(),
                isActive: true,
                mappingSource: 'manual',
            },
            {
                id: 'mapping_2',
                foodId: 'food_chicken_breast',
                platformId: this.platformId,
                skuId: 'mock_chicken_breast_300g',
                confidence: 0.92,
                lastUpdated: new Date(),
                isActive: true,
                mappingSource: 'auto',
            },
        ];

        mockMappings.forEach(mapping => {
            this.mockSkuMappings.set(mapping.foodId, mapping);
        });
    }

    /**
     * 搜索商品
     */
    async searchProducts(foodItem: FoodSearchItem): Promise<PlatformProduct[]> {
        // 模拟搜索延迟
        await this.simulateDelay(300, 800);

        // 根据食物名称生成模拟商品
        const products: PlatformProduct[] = [
            {
                skuId: `mock_${foodItem.foodId}_001`,
                name: `${foodItem.name}(优选)`,
                price: this.generateRandomPrice(5, 25),
                unit: foodItem.unit,
                stock: Math.floor(Math.random() * 100) + 10,
                imageUrl: `https://via.placeholder.com/200x200?text=${encodeURIComponent(foodItem.name)}`,
                description: `优质${foodItem.name}，新鲜直供`,
                brand: '优选品牌',
                specifications: {
                    origin: '本地农场',
                    quality: 'A级',
                    packaging: '环保包装',
                },
            },
            {
                skuId: `mock_${foodItem.foodId}_002`,
                name: `${foodItem.name}(经济装)`,
                price: this.generateRandomPrice(3, 15),
                unit: foodItem.unit,
                stock: Math.floor(Math.random() * 80) + 5,
                imageUrl: `https://via.placeholder.com/200x200?text=${encodeURIComponent(foodItem.name)}`,
                description: `经济实惠的${foodItem.name}`,
                brand: '经济品牌',
                specifications: {
                    origin: '产地直供',
                    quality: 'B级',
                    packaging: '标准包装',
                },
            },
        ];

        return products;
    }

    /**
     * 获取食物SKU映射
     */
    async mapFoodToSku(foodId: string): Promise<SkuMapping | null> {
        await this.simulateDelay(100, 300);
        return this.mockSkuMappings.get(foodId) || null;
    }

    /**
     * 创建订单
     */
    async createOrder(orderRequest: CreateOrderRequest): Promise<PlatformOrder> {
        await this.simulateDelay(500, 1200);

        const mockOrderId = `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // 计算订单金额
        const items = await Promise.all(
            orderRequest.items.map(async item => {
                const price = this.generateRandomPrice(5, 30);
                return {
                    skuId: item.skuId,
                    name: `模拟商品 ${item.skuId}`,
                    price,
                    quantity: item.quantity,
                };
            })
        );

        const subtotalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const deliveryFee = this.calculateDeliveryFee(subtotalAmount);
        const discountAmount = orderRequest.couponCode ? subtotalAmount * 0.1 : 0; // 10%折扣
        const totalAmount = subtotalAmount + deliveryFee - discountAmount;

        const order: PlatformOrder = {
            platformOrderId: mockOrderId,
            status: 'pending',
            totalAmount: Math.round(totalAmount * 100) / 100,
            discountAmount: discountAmount > 0 ? Math.round(discountAmount * 100) / 100 : undefined,
            deliveryFee: Math.round(deliveryFee * 100) / 100,
            paymentUrl: `https://mock-payment.example.com/pay/${mockOrderId}`,
            estimatedDeliveryTime: this.calculateEstimatedDeliveryTime(orderRequest.deliveryTime, orderRequest.scheduledTime),
            trackingInfo: {
                trackingNumber: `TRK_${mockOrderId}`,
                currentStatus: '订单已创建',
                estimatedSteps: [
                    { step: '订单确认', estimatedTime: '5分钟内' },
                    { step: '商品打包', estimatedTime: '20分钟内' },
                    { step: '配送中', estimatedTime: '40分钟内' },
                    { step: '送达', estimatedTime: '60分钟内' },
                ],
            },
            items,
        };

        // 存储订单以便后续查询
        this.mockOrders.set(mockOrderId, order);

        return order;
    }

    /**
     * 获取订单状态
     */
    async getOrderStatus(platformOrderId: string): Promise<OrderStatus> {
        await this.simulateDelay(200, 500);

        const order = this.mockOrders.get(platformOrderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // 模拟订单状态变化
        const statuses: OrderStatus[] = ['pending', 'paid', 'confirmed', 'preparing', 'shipped', 'delivered'];
        const currentIndex = statuses.indexOf(order.status);

        // 有20%概率状态会前进
        if (Math.random() < 0.2 && currentIndex < statuses.length - 1) {
            const newStatus = statuses[currentIndex + 1];
            order.status = newStatus;
            this.mockOrders.set(platformOrderId, order);
            return newStatus;
        }

        return order.status;
    }

    /**
     * 取消订单
     */
    async cancelOrder(platformOrderId: string): Promise<boolean> {
        await this.simulateDelay(300, 600);

        const order = this.mockOrders.get(platformOrderId);
        if (!order) {
            return false;
        }

        // 只有pending和paid状态可以取消
        if (['pending', 'paid'].includes(order.status)) {
            order.status = 'cancelled';
            this.mockOrders.set(platformOrderId, order);
            return true;
        }

        return false;
    }

    /**
     * 获取配送选项
     */
    async getDeliveryOptions(address: DeliveryAddress): Promise<DeliveryOption[]> {
        await this.simulateDelay(200, 400);

        const options: DeliveryOption[] = [
            {
                id: 'standard',
                name: '标准配送',
                description: '1-2小时送达',
                estimatedTime: 90,
                fee: 6.00,
                isDefault: true,
            },
            {
                id: 'express',
                name: '急速配送',
                description: '30-60分钟送达',
                estimatedTime: 45,
                fee: 12.00,
                isDefault: false,
            },
            {
                id: 'scheduled',
                name: '预约配送',
                description: '指定时间送达',
                estimatedTime: 0, // 用户指定
                fee: 3.00,
                isDefault: false,
            },
        ];

        return options;
    }

    /**
     * 估算配送时间
     */
    async estimateDeliveryTime(address: DeliveryAddress): Promise<number> {
        await this.simulateDelay(100, 200);

        // 基于地址计算配送时间（简化逻辑）
        const baseTime = 60; // 基础60分钟
        const cityMultiplier = this.getCityDeliveryMultiplier(address.city);

        return Math.round(baseTime * cityMultiplier);
    }

    /**
     * 检查商品库存
     */
    async checkStock(skuId: string): Promise<number> {
        await this.simulateDelay(150, 300);

        // 返回随机库存数量
        return Math.floor(Math.random() * 100) + 10;
    }

    /**
     * 获取商品价格
     */
    async getPrice(skuId: string): Promise<number> {
        await this.simulateDelay(100, 250);

        return this.generateRandomPrice(5, 50);
    }

    /**
     * 验证配送地址
     */
    async validateAddress(address: DeliveryAddress): Promise<AddressValidationResult> {
        await this.simulateDelay(200, 400);

        // 简单的地址验证逻辑
        const supportedCities = ['北京市', '上海市', '广州市', '深圳市', '杭州市'];
        const isDeliverable = supportedCities.includes(address.city);

        if (!isDeliverable) {
            return {
                isValid: true,
                isDeliverable: false,
                errorMessage: `暂不支持配送到${address.city}`,
            };
        }

        const deliveryOptions = await this.getDeliveryOptions(address);

        return {
            isValid: true,
            isDeliverable: true,
            normalizedAddress: address,
            deliveryOptions,
        };
    }

    // =============
    // 私有辅助方法
    // =============

    private async simulateDelay(minMs: number, maxMs: number): Promise<void> {
        const delay = Math.random() * (maxMs - minMs) + minMs;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    private generateRandomPrice(min: number, max: number): number {
        const price = Math.random() * (max - min) + min;
        return Math.round(price * 100) / 100;
    }

    private calculateDeliveryFee(subtotalAmount: number): number {
        // 满50免配送费
        if (subtotalAmount >= 50) {
            return 0;
        }
        return 6.00;
    }

    private calculateEstimatedDeliveryTime(
        deliveryTime?: 'asap' | 'scheduled',
        scheduledTime?: Date
    ): Date {
        if (deliveryTime === 'scheduled' && scheduledTime) {
            return scheduledTime;
        }

        // 默认1小时后送达
        return new Date(Date.now() + 60 * 60 * 1000);
    }

    private getCityDeliveryMultiplier(city: string): number {
        const multipliers: Record<string, number> = {
            '北京市': 1.0,
            '上海市': 1.1,
            '广州市': 1.2,
            '深圳市': 1.1,
            '杭州市': 1.3,
        };

        return multipliers[city] || 1.5;
    }
}