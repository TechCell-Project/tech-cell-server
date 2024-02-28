import { Injectable } from '@nestjs/common';
import { StatisticsService } from '~libs/resource/statistics/';
import { GetStatsRequestDTO, GetStatsResponseDTO } from './dtos';
import { StatsSplitBy } from './stats-mnt.enum';
import { RedisService } from '~libs/common/Redis/services';
import {
    STAT_ORDER_DAY,
    STAT_ORDER_MONTH,
    STAT_ORDER_YEAR,
    STAT_REVENUE_DAY,
    STAT_REVENUE_MONTH,
    STAT_REVENUE_YEAR,
} from '~libs/common/constants/cache.constant';
import { TCalculate } from '~libs/resource/statistics/types';
import { StatsGetBy, StatsType } from './enums';
import { GetStatsOrdersRequestDTO } from './dtos/get-stats-orders-request.dto';
import { GetStatsOrdersApiRequestDTO } from './dtos/get-stats-orders-request.2.dto';
import { OrderStatusEnum } from '~libs/resource/orders';

@Injectable()
export class StatsMntService {
    constructor(
        private readonly redisService: RedisService,
        private readonly statisticsService: StatisticsService,
    ) {}

    public async getStats(data: GetStatsRequestDTO): Promise<GetStatsResponseDTO> {
        const {
            type,
            fromDate,
            toDate = new Date().toString(),
            splitBy = StatsSplitBy.month,
            refreshCache = false,
        } = data;
        const result: GetStatsResponseDTO = {
            fromDate: fromDate,
            toDate,
        };

        switch (type) {
            case StatsType.Revenue.toLowerCase(): {
                Object.assign(result, {
                    ...(await this.getRevenueStats({
                        ...data,
                        toDate,
                        splitBy,
                        refreshCache,
                    })),
                });
                break;
            }

            case StatsType.Order.toLowerCase(): {
                Object.assign(result, {
                    ...(await this.getOrderStats({
                        ...data,
                        toDate,
                        splitBy,
                        refreshCache,
                    })),
                });
                break;
            }

            default:
                break;
        }

        return result;
    }

    public async getStatsOrders(data: GetStatsOrdersApiRequestDTO) {
        const {
            fromDate,
            toDate = new Date().toString(),
            getBy = StatsGetBy.createdAt,
            refreshCache = false,
        } = data;
        const result: GetStatsResponseDTO = {
            fromDate: fromDate,
            toDate,
        };
        const dataReturn = [];

        for (const [statusKey, statusValue] of Object.entries(OrderStatusEnum)) {
            dataReturn.push({
                name: statusKey,
                value: await this.statisticsService.countOrdersByStatusInTimeRange({
                    fromDate: new Date(fromDate),
                    toDate: new Date(toDate),
                    orderStatus: statusValue,
                    getBy,
                }),
            });
        }

        return {
            ...result,
            data: dataReturn,
        };
    }

    private async getRevenueStats({
        fromDate,
        toDate,
        splitBy,
        refreshCache,
    }: {
        fromDate: string;
        toDate: string;
        splitBy: string;
        refreshCache: boolean;
    }): Promise<GetStatsResponseDTO> {
        const result = [];
        let revenueFunction: (date: Date) => Promise<TCalculate>;
        let refreshCacheKey = '';

        switch (splitBy) {
            case StatsSplitBy.day:
                refreshCacheKey = `${STAT_REVENUE_DAY}*`;
                revenueFunction = (date) =>
                    this.statisticsService.calculateRevenueDay(
                        date.getDate(),
                        date.getMonth(),
                        date.getFullYear(),
                    );
                break;
            case StatsSplitBy.year:
                refreshCacheKey = `${STAT_REVENUE_YEAR}*`;
                revenueFunction = (date) =>
                    this.statisticsService.calculateRevenueYear(date.getFullYear());
                break;
            case StatsSplitBy.month:
            default:
                refreshCacheKey = `${STAT_REVENUE_MONTH}*`;
                revenueFunction = (date) =>
                    this.statisticsService.calculateRevenueMonth(
                        date.getMonth(),
                        date.getFullYear(),
                    );
                break;
        }

        if (refreshCache) {
            const keys = await this.redisService.keys(refreshCacheKey);
            await Promise.all(keys.map((key) => this.redisService.del(key)));
        }

        const dateRanges: Date[] = this.resolveDateRange(fromDate, toDate, splitBy);
        const revenueResults = await Promise.all(dateRanges?.map(revenueFunction));
        revenueResults.forEach((revenue, index) => {
            const dateString = this.getHumanDateString(dateRanges[index], splitBy);
            result.push({ ...revenue, date: dateRanges[index], dateString: dateString });
        });

        const totalRevenue = revenueResults.reduce((a, b) => a + b.revenue, 0);
        const totalOrders = revenueResults.reduce((a, b) => a + b.orders, 0);

        return {
            totalRevenue,
            totalOrders,
            fromDate,
            toDate,
            totalResults: result?.length ?? 0,
            data: result,
        };
    }

    private resolveDateRange(
        fromDate: Date | string,
        toDate: Date | string,
        splitBy: string,
    ): Date[] {
        const dateRanges: Date[] = [];
        let dateIncrementFunction: (date: Date) => void;

        switch (splitBy) {
            case StatsSplitBy.day:
                dateIncrementFunction = (date) => date.setDate(date.getDate() + 1);
                break;
            case StatsSplitBy.year:
                dateIncrementFunction = (date) => date.setFullYear(date.getFullYear() + 1);
                break;
            case StatsSplitBy.month:
            default:
                dateIncrementFunction = (date) => date.setMonth(date.getMonth() + 1);
                break;
        }

        for (let i = new Date(fromDate); i <= new Date(toDate); dateIncrementFunction(i)) {
            dateRanges.push(new Date(i));
        }
        return dateRanges;
    }

    private getHumanDateString(date: Date, splitBy: string): string {
        let dateString = '';
        switch (splitBy) {
            case StatsSplitBy.day:
                dateString = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                break;
            case StatsSplitBy.month:
                dateString = `${date.getMonth() + 1}/${date.getFullYear()}`;
                break;
            case StatsSplitBy.year:
                dateString = `${date.getFullYear()}`;
                break;
        }
        return dateString;
    }

    private async getOrderStats({
        fromDate,
        toDate,
        splitBy,
        refreshCache,
        orderStatus,
        paymentStatus,
        getBy,
    }: {
        fromDate: string;
        toDate: string;
        splitBy: string;
        refreshCache: boolean;
    } & GetStatsOrdersRequestDTO): Promise<GetStatsResponseDTO> {
        const result = [];
        let orderFn: (date: Date) => Promise<number>;
        let refreshCacheKey = '';

        switch (splitBy) {
            case StatsSplitBy.day:
                refreshCacheKey = `${STAT_ORDER_DAY}*`;
                orderFn = (date) =>
                    this.statisticsService.calculateOrders({
                        year: date.getFullYear(),
                        month: date.getMonth() + 1,
                        day: date.getDate(),
                        orderStatus,
                        paymentStatus,
                        getBy,
                    });
                break;

            case StatsSplitBy.year:
                refreshCacheKey = `${STAT_ORDER_YEAR}*`;
                orderFn = (date) =>
                    this.statisticsService.calculateOrders({
                        year: date.getFullYear(),
                        orderStatus,
                        paymentStatus,
                        getBy,
                    });
                break;

            case StatsSplitBy.month:
            default:
                refreshCacheKey = `${STAT_ORDER_MONTH}*`;
                orderFn = (date) =>
                    this.statisticsService.calculateOrders({
                        year: date.getFullYear(),
                        month: date.getMonth() + 1,
                        orderStatus,
                        paymentStatus,
                        getBy,
                    });
                break;
        }

        if (refreshCache) {
            const keys = await this.redisService.keys(refreshCacheKey);
            await Promise.all(keys.map((key) => this.redisService.del(key)));
        }

        const dateRanges: Date[] = this.resolveDateRange(fromDate, toDate, splitBy);
        const dataCalculates = await Promise.all(dateRanges?.map(orderFn));
        dataCalculates.forEach((totalOrderInTime, index) => {
            const date = dateRanges[index];
            let dateString: string;
            switch (splitBy) {
                case StatsSplitBy.day:
                    dateString = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                    break;
                case StatsSplitBy.month:
                    dateString = `${date.getMonth() + 1}/${date.getFullYear()}`;
                    break;
                case StatsSplitBy.year:
                    dateString = `${date.getFullYear()}`;
                    break;
            }
            result.push({ totalOrderInTime: totalOrderInTime, date: date, dateString: dateString });
        });

        return {
            fromDate,
            toDate,
            totalResults: result?.length ?? 0,
            data: result,
        };
    }
}
