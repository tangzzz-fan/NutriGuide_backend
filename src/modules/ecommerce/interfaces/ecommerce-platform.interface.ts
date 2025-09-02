import { DeliveryAddress } from '../dto/delivery-address.dto';

/**
 * 统一的电商平台接口
 * 使用策略模式，支持多个平台的统一接口
 */
export interface EcommercePlatform {
    readonly platformId: string;
    readonly platformName: string;

    // SKU映射和搜索
    searchProducts(foodItem: FoodSearchItem): Promise<PlatformProduct[]>;
    mapFoodToSku(foodId: string): Promise<SkuMapping | null>;

    // 订单操作
    createOrder(orderRequest: CreateOrderRequest): Promise<PlatformOrder>;
    getOrderStatus(platformOrderId: string): Promise<OrderStatus>;
    cancelOrder(platformOrderId: string): Promise<boolean>;

    // 配送信息
    getDeliveryOptions(address: DeliveryAddress): Promise<DeliveryOption[]>;
    estimateDeliveryTime(address: DeliveryAddress): Promise<number>; // minutes

    // 商品库存查询
    checkStock(skuId: string): Promise<number>;

    // 价格查询
    getPrice(skuId: string): Promise<number>;
}

/**
 * 食物搜索项目
 */
export interface FoodSearchItem {
    foodId: string;
    name: string;
    category?: string;
    unit: string;
}

/**
 * 平台商品信息
 */
export interface PlatformProduct {
    skuId: string;
    name: string;
    price: number;
    unit: string;
    stock: number;
    imageUrl?: string;
    description?: string;
    brand?: string;
    specifications?: Record<string, any>;
}

/**
 * SKU映射关系
 */
export interface SkuMapping {
    id: string;
    foodId: string;
    platformId: string;
    skuId: string;
    confidence: number; // 0-1, 映射置信度
    lastUpdated: Date;
    isActive: boolean;
    mappingSource: 'manual' | 'auto' | 'ai'; // 映射来源
}

/**
 * 订单创建请求
 */
export interface CreateOrderRequest {
    items: Array<{
        skuId: string;
        quantity: number;
    }>;
    deliveryAddress: DeliveryAddress;
    deliveryTime?: 'asap' | 'scheduled';
    scheduledTime?: Date;
    paymentMethod?: string;
    couponCode?: string;
    notes?: string;
}

/**
 * 平台订单信息
 */
export interface PlatformOrder {
    platformOrderId: string;
    status: OrderStatus;
    totalAmount: number;
    discountAmount?: number;
    deliveryFee?: number;
    paymentUrl?: string;
    estimatedDeliveryTime?: Date;
    trackingInfo?: any;
    items: Array<{
        skuId: string;
        name: string;
        price: number;
        quantity: number;
    }>;
}

/**
 * 订单状态枚举
 */
export type OrderStatus =
    | 'pending'      // 待支付
    | 'paid'         // 已支付
    | 'confirmed'    // 已确认
    | 'preparing'    // 备货中
    | 'shipped'      // 已发货
    | 'delivered'    // 已送达
    | 'cancelled'    // 已取消
    | 'refunded';    // 已退款

/**
 * 配送选项
 */
export interface DeliveryOption {
    id: string;
    name: string;
    description: string;
    estimatedTime: number; // minutes
    fee: number;
    isDefault: boolean;
}

/**
 * 平台错误类型
 */
export class PlatformError extends Error {
    constructor(
        public platformId: string,
        public errorCode: string,
        message: string,
        public originalError?: any
    ) {
        super(message);
        this.name = 'PlatformError';
    }
}

/**
 * 配送地址验证结果
 */
export interface AddressValidationResult {
    isValid: boolean;
    isDeliverable: boolean;
    normalizedAddress?: DeliveryAddress;
    deliveryOptions?: DeliveryOption[];
    errorMessage?: string;
}