import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
    Query,
    HttpStatus,
    Patch,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
    ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EcommerceService } from './ecommerce.service';
import { CreateOrderDto, OrderResponseDto, DeliveryAddress } from './dto';

@ApiTags('E-commerce')
@Controller('ecommerce')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EcommerceController {
    constructor(private readonly ecommerceService: EcommerceService) { }

    @Post('orders')
    @ApiOperation({
        summary: '创建订单',
        description: '基于购物清单创建电商平台订单'
    })
    @ApiBody({ type: CreateOrderDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: '订单创建成功',
        type: OrderResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: '请求参数错误或平台不可用',
    })
    async createOrder(
        @Request() req,
        @Body() createOrderDto: CreateOrderDto,
    ): Promise<{ statusCode: number; message: string; data: OrderResponseDto }> {
        const order = await this.ecommerceService.createOrder(req.user.userId, createOrderDto);
        return {
            statusCode: HttpStatus.CREATED,
            message: '订单创建成功',
            data: order,
        };
    }

    @Get('orders')
    @ApiOperation({
        summary: '获取用户订单列表',
        description: '获取当前用户的所有订单'
    })
    @ApiQuery({
        name: 'status',
        required: false,
        description: '按状态过滤',
        enum: ['pending', 'paid', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '订单列表获取成功',
        type: [OrderResponseDto],
    })
    async getUserOrders(
        @Request() req,
        @Query('status') status?: string,
    ): Promise<{ statusCode: number; message: string; data: OrderResponseDto[] }> {
        const orders = await this.ecommerceService.getUserOrders(req.user.userId, status);
        return {
            statusCode: HttpStatus.OK,
            message: '订单列表获取成功',
            data: orders,
        };
    }

    @Get('orders/statistics')
    @ApiOperation({
        summary: '获取订单统计',
        description: '获取用户订单统计信息'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '订单统计获取成功',
    })
    async getOrderStatistics(
        @Request() req,
    ): Promise<{ statusCode: number; message: string; data: any }> {
        const statistics = await this.ecommerceService.getOrderStatistics(req.user.userId);
        return {
            statusCode: HttpStatus.OK,
            message: '订单统计获取成功',
            data: statistics,
        };
    }

    @Get('orders/:id')
    @ApiOperation({
        summary: '获取订单详情',
        description: '根据订单ID获取订单详细信息'
    })
    @ApiParam({ name: 'id', description: '订单ID', example: '507f1f77bcf86cd799439014' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '订单详情获取成功',
        type: OrderResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: '订单不存在',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: '无权访问此订单',
    })
    async getOrderById(
        @Request() req,
        @Param('id') id: string,
    ): Promise<{ statusCode: number; message: string; data: OrderResponseDto }> {
        const order = await this.ecommerceService.getOrderById(id, req.user.userId);
        return {
            statusCode: HttpStatus.OK,
            message: '订单详情获取成功',
            data: order,
        };
    }

    @Patch('orders/:id/status')
    @ApiOperation({
        summary: '更新订单状态',
        description: '从电商平台同步最新的订单状态'
    })
    @ApiParam({ name: 'id', description: '订单ID', example: '507f1f77bcf86cd799439014' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '订单状态更新成功',
        type: OrderResponseDto,
    })
    async updateOrderStatus(
        @Request() req,
        @Param('id') id: string,
    ): Promise<{ statusCode: number; message: string; data: OrderResponseDto }> {
        const order = await this.ecommerceService.updateOrderStatus(id, req.user.userId);
        return {
            statusCode: HttpStatus.OK,
            message: '订单状态更新成功',
            data: order,
        };
    }

    @Patch('orders/:id/cancel')
    @ApiOperation({
        summary: '取消订单',
        description: '取消指定的订单'
    })
    @ApiParam({ name: 'id', description: '订单ID', example: '507f1f77bcf86cd799439014' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '订单取消成功',
        type: OrderResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: '订单状态不支持取消',
    })
    async cancelOrder(
        @Request() req,
        @Param('id') id: string,
    ): Promise<{ statusCode: number; message: string; data: OrderResponseDto }> {
        const order = await this.ecommerceService.cancelOrder(id, req.user.userId);
        return {
            statusCode: HttpStatus.OK,
            message: '订单取消成功',
            data: order,
        };
    }

    @Get('platforms')
    @ApiOperation({
        summary: '获取支持的电商平台',
        description: '获取当前支持的所有电商平台列表'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '平台列表获取成功',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 200 },
                message: { type: 'string', example: '平台列表获取成功' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: 'mock' },
                            name: { type: 'string', example: 'Mock电商平台' },
                            isAvailable: { type: 'boolean', example: true }
                        }
                    }
                }
            }
        }
    })
    async getSupportedPlatforms(): Promise<{ statusCode: number; message: string; data: any[] }> {
        const platforms = await this.ecommerceService.getSupportedPlatforms();
        return {
            statusCode: HttpStatus.OK,
            message: '平台列表获取成功',
            data: platforms,
        };
    }

    @Post('platforms/:platformId/delivery-options')
    @ApiOperation({
        summary: '获取配送选项',
        description: '根据配送地址获取指定平台的配送选项'
    })
    @ApiParam({ name: 'platformId', description: '平台ID', example: 'mock' })
    @ApiBody({ type: DeliveryAddress })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '配送选项获取成功',
    })
    async getDeliveryOptions(
        @Param('platformId') platformId: string,
        @Body() address: DeliveryAddress,
    ): Promise<{ statusCode: number; message: string; data: any[] }> {
        const options = await this.ecommerceService.getDeliveryOptions(platformId, address);
        return {
            statusCode: HttpStatus.OK,
            message: '配送选项获取成功',
            data: options,
        };
    }

    @Post('webhooks/:platformId')
    @ApiOperation({
        summary: '平台Webhook回调',
        description: '接收来自电商平台的订单状态更新通知'
    })
    @ApiParam({ name: 'platformId', description: '平台ID', example: 'jddj' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Webhook处理成功',
    })
    async handlePlatformWebhook(
        @Param('platformId') platformId: string,
        @Body() webhookData: any,
    ): Promise<{ statusCode: number; message: string }> {
        await this.ecommerceService.handlePlatformWebhook(platformId, webhookData);
        return {
            statusCode: HttpStatus.OK,
            message: 'Webhook处理成功',
        };
    }
}