import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, ValidateNested, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryAddress } from './delivery-address.dto';

export class OrderItemDto {
    @ApiProperty({ description: 'SKU ID', example: 'jd_12345' })
    @IsNotEmpty()
    @IsString()
    skuId: string;

    @ApiProperty({ description: '商品数量', example: 2 })
    @IsNotEmpty()
    @IsNumber()
    quantity: number;
}

export class CreateOrderDto {
    @ApiProperty({ description: '购物清单ID', example: '507f1f77bcf86cd799439013' })
    @IsNotEmpty()
    @IsString()
    shoppingListId: string;

    @ApiProperty({ description: '电商平台ID', example: 'jddj', enum: ['jddj', 'dingdong', 'meituan', 'mock'] })
    @IsNotEmpty()
    @IsEnum(['jddj', 'dingdong', 'meituan', 'mock'])
    platformId: string;

    @ApiProperty({ description: '配送地址', type: DeliveryAddress })
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => DeliveryAddress)
    deliveryAddress: DeliveryAddress;

    @ApiProperty({ description: '配送时间类型', enum: ['asap', 'scheduled'], example: 'asap', required: false })
    @IsOptional()
    @IsEnum(['asap', 'scheduled'])
    deliveryTime?: 'asap' | 'scheduled';

    @ApiProperty({ description: '预约配送时间', example: '2025-09-03T14:00:00.000Z', required: false })
    @IsOptional()
    @IsDateString()
    scheduledTime?: string;

    @ApiProperty({ description: '支付方式', example: 'wechat_pay', required: false })
    @IsOptional()
    @IsString()
    paymentMethod?: string;

    @ApiProperty({ description: '优惠券代码', example: 'WELCOME10', required: false })
    @IsOptional()
    @IsString()
    couponCode?: string;

    @ApiProperty({ description: '备注信息', example: '请在门口按门铃', required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}