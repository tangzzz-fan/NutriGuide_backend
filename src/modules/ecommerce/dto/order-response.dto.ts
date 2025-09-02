import { ApiProperty } from '@nestjs/swagger';
import { DeliveryAddress } from './delivery-address.dto';

export class OrderItemResponseDto {
    @ApiProperty({ description: 'SKU ID', example: 'jd_12345' })
    skuId: string;

    @ApiProperty({ description: '商品名称', example: '有机西兰花 500g' })
    name: string;

    @ApiProperty({ description: '商品价格', example: 12.50 })
    price: number;

    @ApiProperty({ description: '购买数量', example: 2 })
    quantity: number;

    @ApiProperty({ description: '小计金额', example: 25.00 })
    subtotal: number;
}

export class OrderResponseDto {
    @ApiProperty({ description: '内部订单ID', example: '507f1f77bcf86cd799439014' })
    id: string;

    @ApiProperty({ description: '平台订单ID', example: 'JD_2025090201234567' })
    platformOrderId: string;

    @ApiProperty({ description: '用户ID', example: '507f1f77bcf86cd799439010' })
    userId: string;

    @ApiProperty({ description: '购物清单ID', example: '507f1f77bcf86cd799439013' })
    shoppingListId: string;

    @ApiProperty({ description: '电商平台ID', example: 'jddj' })
    platformId: string;

    @ApiProperty({
        description: '订单状态',
        enum: ['pending', 'paid', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        example: 'pending'
    })
    status: string;

    @ApiProperty({ description: '订单商品', type: [OrderItemResponseDto] })
    items: OrderItemResponseDto[];

    @ApiProperty({ description: '商品总金额', example: 50.00 })
    subtotalAmount: number;

    @ApiProperty({ description: '配送费', example: 6.00 })
    deliveryFee: number;

    @ApiProperty({ description: '优惠金额', example: 5.00, required: false })
    discountAmount?: number;

    @ApiProperty({ description: '订单总金额', example: 51.00 })
    totalAmount: number;

    @ApiProperty({ description: '配送地址', type: DeliveryAddress })
    deliveryAddress: DeliveryAddress;

    @ApiProperty({ description: '预计配送时间', example: '2025-09-02T15:30:00.000Z', required: false })
    estimatedDeliveryTime?: Date;

    @ApiProperty({ description: '支付链接', example: 'https://pay.example.com/order/123', required: false })
    paymentUrl?: string;

    @ApiProperty({ description: '物流追踪信息', required: false })
    trackingInfo?: any;

    @ApiProperty({ description: '订单备注', required: false })
    notes?: string;

    @ApiProperty({ description: '创建时间', example: '2025-09-02T10:30:00.000Z' })
    createdAt: Date;

    @ApiProperty({ description: '更新时间', example: '2025-09-02T10:30:00.000Z' })
    updatedAt: Date;
}