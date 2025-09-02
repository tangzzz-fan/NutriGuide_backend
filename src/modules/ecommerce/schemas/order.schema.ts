import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type OrderDocument = Order & Document;

@Schema()
export class OrderItem {
    @ApiProperty({ description: 'SKU ID', example: 'jd_12345' })
    @Prop({ required: true })
    skuId: string;

    @ApiProperty({ description: '商品名称', example: '有机西兰花 500g' })
    @Prop({ required: true })
    name: string;

    @ApiProperty({ description: '商品价格', example: 12.50 })
    @Prop({ required: true })
    price: number;

    @ApiProperty({ description: '购买数量', example: 2 })
    @Prop({ required: true })
    quantity: number;

    @ApiProperty({ description: '小计金额', example: 25.00 })
    @Prop({ required: true })
    subtotal: number;
}

@Schema()
export class DeliveryAddressSchema {
    @ApiProperty({ description: '省份', example: '北京市' })
    @Prop({ required: true })
    province: string;

    @ApiProperty({ description: '城市', example: '北京市' })
    @Prop({ required: true })
    city: string;

    @ApiProperty({ description: '区县', example: '朝阳区' })
    @Prop({ required: true })
    district: string;

    @ApiProperty({ description: '详细地址', example: '三里屯街道工体北路123号' })
    @Prop({ required: true })
    address: string;

    @ApiProperty({ description: '邮政编码', example: '100027' })
    @Prop()
    zipCode?: string;

    @ApiProperty({ description: '收件人姓名', example: '张三' })
    @Prop({ required: true })
    recipientName: string;

    @ApiProperty({ description: '收件人电话', example: '13812345678' })
    @Prop({ required: true })
    recipientPhone: string;

    @ApiProperty({ description: '经度', example: 116.447836 })
    @Prop()
    longitude?: number;

    @ApiProperty({ description: '纬度', example: 39.905527 })
    @Prop()
    latitude?: number;

    @ApiProperty({ description: '地址标签', example: '家' })
    @Prop()
    tag?: string;
}

@Schema({ timestamps: true })
export class Order {
    @ApiProperty({ description: '订单ID' })
    _id: Types.ObjectId;

    @ApiProperty({ description: '平台订单ID', example: 'JD_2025090201234567' })
    @Prop({ required: true, unique: true })
    platformOrderId: string;

    @ApiProperty({ description: '用户ID' })
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @ApiProperty({ description: '购物清单ID' })
    @Prop({ type: Types.ObjectId, ref: 'ShoppingList', required: true })
    shoppingListId: Types.ObjectId;

    @ApiProperty({ description: '电商平台ID', example: 'jddj' })
    @Prop({ required: true })
    platformId: string;

    @ApiProperty({
        description: '订单状态',
        enum: ['pending', 'paid', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        example: 'pending'
    })
    @Prop({
        enum: ['pending', 'paid', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending'
    })
    status: string;

    @ApiProperty({ description: '订单商品', type: [OrderItem] })
    @Prop({ type: [OrderItem], required: true })
    items: OrderItem[];

    @ApiProperty({ description: '商品总金额', example: 50.00 })
    @Prop({ required: true })
    subtotalAmount: number;

    @ApiProperty({ description: '配送费', example: 6.00 })
    @Prop({ required: true })
    deliveryFee: number;

    @ApiProperty({ description: '优惠金额', example: 5.00 })
    @Prop()
    discountAmount?: number;

    @ApiProperty({ description: '订单总金额', example: 51.00 })
    @Prop({ required: true })
    totalAmount: number;

    @ApiProperty({ description: '配送地址', type: DeliveryAddressSchema })
    @Prop({ type: DeliveryAddressSchema, required: true })
    deliveryAddress: DeliveryAddressSchema;

    @ApiProperty({ description: '预计配送时间', example: '2025-09-02T15:30:00.000Z' })
    @Prop()
    estimatedDeliveryTime?: Date;

    @ApiProperty({ description: '支付链接', example: 'https://pay.example.com/order/123' })
    @Prop()
    paymentUrl?: string;

    @ApiProperty({ description: '物流追踪信息' })
    @Prop({ type: Object })
    trackingInfo?: any;

    @ApiProperty({ description: '订单备注' })
    @Prop()
    notes?: string;

    @ApiProperty({ description: '支付方式', example: 'wechat_pay' })
    @Prop()
    paymentMethod?: string;

    @ApiProperty({ description: '优惠券代码', example: 'WELCOME10' })
    @Prop()
    couponCode?: string;

    @ApiProperty({ description: '配送时间类型', enum: ['asap', 'scheduled'], example: 'asap' })
    @Prop({ enum: ['asap', 'scheduled'] })
    deliveryTime?: string;

    @ApiProperty({ description: '预约配送时间', example: '2025-09-03T14:00:00.000Z' })
    @Prop()
    scheduledTime?: Date;

    @ApiProperty({ description: '创建时间' })
    createdAt: Date;

    @ApiProperty({ description: '更新时间' })
    updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// 创建索引
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ platformOrderId: 1 });
OrderSchema.index({ shoppingListId: 1 });
OrderSchema.index({ platformId: 1, status: 1 });