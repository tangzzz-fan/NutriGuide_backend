import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsLatitude, IsLongitude } from 'class-validator';

export class DeliveryAddress {
    @ApiProperty({ description: '省份', example: '北京市' })
    @IsNotEmpty()
    @IsString()
    province: string;

    @ApiProperty({ description: '城市', example: '北京市' })
    @IsNotEmpty()
    @IsString()
    city: string;

    @ApiProperty({ description: '区县', example: '朝阳区' })
    @IsNotEmpty()
    @IsString()
    district: string;

    @ApiProperty({ description: '详细地址', example: '三里屯街道工体北路123号' })
    @IsNotEmpty()
    @IsString()
    address: string;

    @ApiProperty({ description: '邮政编码', example: '100027', required: false })
    @IsOptional()
    @IsString()
    zipCode?: string;

    @ApiProperty({ description: '收件人姓名', example: '张三' })
    @IsNotEmpty()
    @IsString()
    recipientName: string;

    @ApiProperty({ description: '收件人电话', example: '13812345678' })
    @IsNotEmpty()
    @IsString()
    recipientPhone: string;

    @ApiProperty({ description: '经度', example: 116.447836, required: false })
    @IsOptional()
    @IsLongitude()
    longitude?: number;

    @ApiProperty({ description: '纬度', example: 39.905527, required: false })
    @IsOptional()
    @IsLatitude()
    latitude?: number;

    @ApiProperty({ description: '地址标签', example: '家', required: false })
    @IsOptional()
    @IsString()
    tag?: string;

    @ApiProperty({ description: '是否为默认地址', example: false, required: false })
    @IsOptional()
    isDefault?: boolean;
}