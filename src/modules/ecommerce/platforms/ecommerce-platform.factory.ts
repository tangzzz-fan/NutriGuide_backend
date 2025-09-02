import { Injectable } from '@nestjs/common';
import { EcommercePlatform } from '../interfaces/ecommerce-platform.interface';
import { MockEcommercePlatform } from './mock-ecommerce.platform';

/**
 * 电商平台工厂
 * 使用工厂模式，根据平台ID创建对应的平台实现
 */
@Injectable()
export class EcommercePlatformFactory {

    /**
     * 创建电商平台实例
     * @param platformId 平台ID
     * @returns 电商平台实例
     */
    static create(platformId: string): EcommercePlatform {
        switch (platformId) {
            case 'mock':
                return new MockEcommercePlatform();
            case 'jddj':
                // TODO: 实现京东到家适配器
                // return new JingdongDaojiaAdapter();
                throw new Error('京东到家平台暂未实现，请使用mock模式');
            case 'dingdong':
                // TODO: 实现叮咚买菜适配器
                // return new DingdongMaicaiAdapter();
                throw new Error('叮咚买菜平台暂未实现，请使用mock模式');
            case 'meituan':
                // TODO: 实现美团买菜适配器
                // return new MeituanMaicaiAdapter();
                throw new Error('美团买菜平台暂未实现，请使用mock模式');
            default:
                throw new Error(`不支持的电商平台: ${platformId}`);
        }
    }

    /**
     * 获取支持的平台列表
     */
    static getSupportedPlatforms(): Array<{ id: string; name: string; isAvailable: boolean }> {
        return [
            { id: 'mock', name: 'Mock电商平台', isAvailable: true },
            { id: 'jddj', name: '京东到家', isAvailable: false },
            { id: 'dingdong', name: '叮咚买菜', isAvailable: false },
            { id: 'meituan', name: '美团买菜', isAvailable: false },
        ];
    }

    /**
     * 检查平台是否可用
     */
    static isPlatformAvailable(platformId: string): boolean {
        const supportedPlatforms = this.getSupportedPlatforms();
        const platform = supportedPlatforms.find(p => p.id === platformId);
        return platform ? platform.isAvailable : false;
    }
}