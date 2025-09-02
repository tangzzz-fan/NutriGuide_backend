import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto, OrderResponseDto } from './dto';
import { EcommercePlatformFactory } from './platforms/ecommerce-platform.factory';
import { EcommercePlatform, CreateOrderRequest } from './interfaces/ecommerce-platform.interface';

@Injectable()
export class EcommerceService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    ) { }

    /**
     * 创建订单
     */
    async createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
        // 检查平台是否可用
        if (!EcommercePlatformFactory.isPlatformAvailable(createOrderDto.platformId)) {
            throw new BadRequestException(`平台 ${createOrderDto.platformId} 暂不可用，请使用mock模式进行测试`);
        }

        // 获取平台实例
        const platform: EcommercePlatform = EcommercePlatformFactory.create(createOrderDto.platformId);

        // TODO: 实际项目中需要从购物清单获取商品信息
        // 这里使用模拟数据
        const mockItems = [
            { skuId: 'mock_broccoli_500g', quantity: 1 },
            { skuId: 'mock_chicken_breast_300g', quantity: 2 },
        ];

        // 构建平台订单请求
        const orderRequest: CreateOrderRequest = {
            items: mockItems,
            deliveryAddress: createOrderDto.deliveryAddress,
            deliveryTime: createOrderDto.deliveryTime,
            scheduledTime: createOrderDto.scheduledTime ? new Date(createOrderDto.scheduledTime) : undefined,
            paymentMethod: createOrderDto.paymentMethod,
            couponCode: createOrderDto.couponCode,
            notes: createOrderDto.notes,
        };

        // 调用平台API创建订单
        const platformOrder = await platform.createOrder(orderRequest);

        // 计算各项金额
        const subtotalAmount = platformOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const deliveryFee = platformOrder.deliveryFee || 0;
        const discountAmount = platformOrder.discountAmount || 0;

        // 保存订单到数据库
        const order = new this.orderModel({
            platformOrderId: platformOrder.platformOrderId,
            userId: new Types.ObjectId(userId),
            shoppingListId: new Types.ObjectId(createOrderDto.shoppingListId),
            platformId: createOrderDto.platformId,
            status: platformOrder.status,
            items: platformOrder.items.map(item => ({
                ...item,
                subtotal: item.price * item.quantity,
            })),
            subtotalAmount,
            deliveryFee,
            discountAmount: discountAmount > 0 ? discountAmount : undefined,
            totalAmount: platformOrder.totalAmount,
            deliveryAddress: createOrderDto.deliveryAddress,
            estimatedDeliveryTime: platformOrder.estimatedDeliveryTime,
            paymentUrl: platformOrder.paymentUrl,
            trackingInfo: platformOrder.trackingInfo,
            notes: createOrderDto.notes,
            paymentMethod: createOrderDto.paymentMethod,
            couponCode: createOrderDto.couponCode,
            deliveryTime: createOrderDto.deliveryTime,
            scheduledTime: createOrderDto.scheduledTime ? new Date(createOrderDto.scheduledTime) : undefined,
        });

        const savedOrder = await order.save();
        return this.mapToResponseDto(savedOrder);
    }

    /**
     * 获取用户订单列表
     */
    async getUserOrders(userId: string, status?: string): Promise<OrderResponseDto[]> {
        const query: any = { userId: new Types.ObjectId(userId) };

        if (status) {
            query.status = status;
        }

        const orders = await this.orderModel
            .find(query)
            .sort({ createdAt: -1 })
            .exec();

        return orders.map(order => this.mapToResponseDto(order));
    }

    /**
     * 获取订单详情
     */
    async getOrderById(orderId: string, userId: string): Promise<OrderResponseDto> {
        const order = await this.orderModel.findById(orderId).exec();

        if (!order) {
            throw new NotFoundException('订单不存在');
        }

        // 检查订单所有权
        if (order.userId.toString() !== userId) {
            throw new ForbiddenException('无权访问此订单');
        }

        return this.mapToResponseDto(order);
    }

    /**
     * 更新订单状态
     */
    async updateOrderStatus(orderId: string, userId: string): Promise<OrderResponseDto> {
        const order = await this.orderModel.findById(orderId).exec();

        if (!order) {
            throw new NotFoundException('订单不存在');
        }

        // 检查订单所有权
        if (order.userId.toString() !== userId) {
            throw new ForbiddenException('无权访问此订单');
        }

        // 获取平台实例
        const platform: EcommercePlatform = EcommercePlatformFactory.create(order.platformId);

        try {
            // 从平台获取最新状态
            const latestStatus = await platform.getOrderStatus(order.platformOrderId);

            // 更新本地订单状态
            order.status = latestStatus;
            const updatedOrder = await order.save();

            return this.mapToResponseDto(updatedOrder);
        } catch (error) {
            // 如果平台查询失败，返回当前状态
            console.error(`Failed to update order status from platform: ${error.message}`);
            return this.mapToResponseDto(order);
        }
    }

    /**
     * 取消订单
     */
    async cancelOrder(orderId: string, userId: string): Promise<OrderResponseDto> {
        const order = await this.orderModel.findById(orderId).exec();

        if (!order) {
            throw new NotFoundException('订单不存在');
        }

        // 检查订单所有权
        if (order.userId.toString() !== userId) {
            throw new ForbiddenException('无权访问此订单');
        }

        // 检查订单状态是否可以取消
        if (!['pending', 'paid', 'confirmed'].includes(order.status)) {
            throw new BadRequestException('订单当前状态不支持取消');
        }

        // 获取平台实例
        const platform: EcommercePlatform = EcommercePlatformFactory.create(order.platformId);

        try {
            // 调用平台取消订单
            const cancelled = await platform.cancelOrder(order.platformOrderId);

            if (cancelled) {
                order.status = 'cancelled';
                const updatedOrder = await order.save();
                return this.mapToResponseDto(updatedOrder);
            } else {
                throw new BadRequestException('平台取消订单失败');
            }
        } catch (error) {
            throw new BadRequestException(`取消订单失败: ${error.message}`);
        }
    }

    /**
     * 获取支持的平台列表
     */
    async getSupportedPlatforms(): Promise<Array<{ id: string; name: string; isAvailable: boolean }>> {
        return EcommercePlatformFactory.getSupportedPlatforms();
    }

    /**
     * 获取配送选项
     */
    async getDeliveryOptions(platformId: string, address: any): Promise<any[]> {
        if (!EcommercePlatformFactory.isPlatformAvailable(platformId)) {
            throw new BadRequestException(`平台 ${platformId} 暂不可用`);
        }

        const platform: EcommercePlatform = EcommercePlatformFactory.create(platformId);
        return platform.getDeliveryOptions(address);
    }

    /**
     * 获取用户订单统计
     */
    async getOrderStatistics(userId: string): Promise<any> {
        const stats = await this.orderModel.aggregate([
            { $match: { userId: new Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' },
                }
            }
        ]);

        const totalOrders = await this.orderModel.countDocuments({ userId: new Types.ObjectId(userId) });

        return {
            totalOrders,
            byStatus: stats.reduce((acc, stat) => {
                acc[stat._id] = {
                    count: stat.count,
                    totalAmount: stat.totalAmount || 0,
                };
                return acc;
            }, {}),
        };
    }

    /**
     * 处理平台webhook回调
     */
    async handlePlatformWebhook(platformId: string, webhookData: any): Promise<void> {
        // TODO: 实现webhook处理逻辑
        // 1. 验证webhook签名
        // 2. 解析订单状态更新
        // 3. 更新本地订单状态
        // 4. 发送用户通知

        console.log(`Received webhook from platform ${platformId}:`, webhookData);

        // 这里可以根据webhook数据更新订单状态
        // 暂时只记录日志
    }

    /**
     * 映射到响应DTO
     */
    private mapToResponseDto(order: OrderDocument): OrderResponseDto {
        return {
            id: order._id.toString(),
            platformOrderId: order.platformOrderId,
            userId: order.userId.toString(),
            shoppingListId: order.shoppingListId.toString(),
            platformId: order.platformId,
            status: order.status,
            items: order.items.map(item => ({
                skuId: item.skuId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.subtotal,
            })),
            subtotalAmount: order.subtotalAmount,
            deliveryFee: order.deliveryFee,
            discountAmount: order.discountAmount,
            totalAmount: order.totalAmount,
            deliveryAddress: order.deliveryAddress as any,
            estimatedDeliveryTime: order.estimatedDeliveryTime,
            paymentUrl: order.paymentUrl,
            trackingInfo: order.trackingInfo,
            notes: order.notes,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        };
    }
}