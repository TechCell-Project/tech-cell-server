import { Injectable } from '@nestjs/common';
import { RedisService } from '~libs/common/Redis';
import { Order, OrdersService, OrderStatusEnum } from '~libs/resource/orders';
import { ProductsService } from '~libs/resource/products';
import { REVENUE_DAY, REVENUE_MONTH, REVENUE_YEAR } from '~libs/common/constants/cache.constant';
import { isCurrentTime } from '~libs/common/utils/shared.util';
import { convertTimeString } from 'convert-time-string';
import { TCalculate } from '../types';

@Injectable()
export class StatisticsService {
    constructor(
        private readonly redisService: RedisService,
        private readonly ordersService: OrdersService,
        private readonly productsService: ProductsService,
    ) {}

    private calculateRevenue(orders: Order[]): number {
        if (!orders) return 0;
        const revenue = orders.reduce((acc, cur) => acc + cur.checkoutOrder.totalPrice, 0);
        return revenue;
    }

    async calculateRevenueYear(year: number): Promise<TCalculate> {
        const cacheKey = `${REVENUE_YEAR}_${year}`;
        const isCurrent = isCurrentTime(year);
        if (!isCurrent) {
            const cached = await this.redisService.get<TCalculate>(cacheKey);
            if (cached !== null) {
                console.log(cached);
                return cached;
            }
        }

        const orders = await this.ordersService.getOrdersOrNull({
            orderStatus: OrderStatusEnum.COMPLETED,
            $and: [
                {
                    createdAt: {
                        $gte: new Date(year, 0, 1).toISOString(),
                    },
                },
                {
                    createdAt: {
                        $lte: new Date(year, 11, 31).toISOString(),
                    },
                },
            ],
        });
        const ttl = isCurrent ? convertTimeString('1h') : convertTimeString('3d');

        const revenue = this.calculateRevenue(orders);
        const result: TCalculate = { revenue, orders: orders?.length ?? 0 };
        await this.redisService.set(cacheKey, result, ttl);
        return result;
    }

    async calculateRevenueMonth(month: number, year: number): Promise<TCalculate> {
        const cacheKey = `${REVENUE_MONTH}_${year}_${month}`;
        const isCurrent = isCurrentTime(year, month);
        if (!isCurrent) {
            const cached = await this.redisService.get<TCalculate>(cacheKey);
            if (cached !== null) return cached;
        }

        const orders = await this.ordersService.getOrdersOrNull({
            orderStatus: OrderStatusEnum.COMPLETED,
            $and: [
                {
                    createdAt: {
                        $gte: new Date(year, month - 1, 1).toISOString(),
                    },
                },
                {
                    createdAt: {
                        $lte: new Date(year, month - 1, 31).toISOString(),
                    },
                },
            ],
        });
        const ttl = isCurrent ? convertTimeString('5m') : convertTimeString('3h');

        const revenue = this.calculateRevenue(orders);
        const result: TCalculate = { revenue, orders: orders?.length ?? 0 };
        await this.redisService.set(cacheKey, result, ttl);
        return result;
    }

    async calculateRevenueDay(day: number, month: number, year: number): Promise<TCalculate> {
        const cacheKey = `${REVENUE_DAY}_${year}_${month}_${day}`;
        const isCurrent = isCurrentTime(year, month, day);
        if (!isCurrent) {
            const cached = await this.redisService.get<TCalculate>(cacheKey);
            if (cached !== null) return cached;
        }

        const orders = await this.ordersService.getOrdersOrNull({
            orderStatus: OrderStatusEnum.COMPLETED,
            $and: [
                {
                    createdAt: {
                        $gte: new Date(year, month - 1, day).toISOString(),
                    },
                },
                {
                    createdAt: {
                        $lt: new Date(year, month - 1, day + 1).toISOString(),
                    },
                },
            ],
        });
        const ttl = isCurrent ? convertTimeString('5m') : convertTimeString('3h');

        const revenue = this.calculateRevenue(orders);
        const result: TCalculate = { revenue, orders: orders?.length ?? 0 };
        await this.redisService.set(cacheKey, result, ttl);
        return result;
    }

    async calculateRevenueHour(
        hour: number,
        day: number,
        month: number,
        year: number,
    ): Promise<TCalculate> {
        const cacheKey = `${REVENUE_DAY}_${year}_${month}_${day}_${hour}`;
        const isCurrent = isCurrentTime(year, month, day, hour);
        if (!isCurrent) {
            const cached = await this.redisService.get<TCalculate>(cacheKey);
            if (cached !== null) return cached;
        }

        const orders = await this.ordersService.getOrders({
            orderStatus: OrderStatusEnum.COMPLETED,
            $and: [
                {
                    createdAt: {
                        $gte: new Date(year, month - 1, day, hour).toISOString(),
                    },
                },
                {
                    createdAt: {
                        $lt: new Date(year, month - 1, day, hour + 1).toISOString(),
                    },
                },
            ],
        });
        const ttl = isCurrent ? convertTimeString('1m') : convertTimeString('3h');

        const revenue = this.calculateRevenue(orders);
        const result: TCalculate = { revenue, orders: orders?.length ?? 0 };
        await this.redisService.set(cacheKey, result, ttl);
        return result;
    }
}
