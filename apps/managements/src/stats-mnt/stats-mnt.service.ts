import { Injectable } from '@nestjs/common';
import { StatisticsService } from '~libs/resource/statistics/';
import { GetStatsRequestDTO, GetStatsResponseDTO } from './dtos';
import { StatsSplitBy } from './stats-mnt.enum';
import { RedisService } from '~libs/common/Redis/services';
import { REVENUE_DAY, REVENUE_MONTH, REVENUE_YEAR } from '~libs/common/constants/cache.constant';
import { TCalculate } from '~libs/resource/statistics/types';

@Injectable()
export class StatsMntService {
    constructor(
        private readonly redisService: RedisService,
        private readonly statisticsService: StatisticsService,
    ) {}

    async getStats({
        fromDate,
        toDate,
        splitBy,
        refreshCache,
    }: GetStatsRequestDTO): Promise<GetStatsResponseDTO> {
        const result = [];
        const dateRanges: Date[] = [];
        let dateIncrementFunction: (date: Date) => void;
        let revenueFunction: (date: Date) => Promise<TCalculate>;
        let refreshCacheKey = '';

        switch (splitBy) {
            case StatsSplitBy.day:
                refreshCacheKey = `${REVENUE_DAY}*`;
                dateIncrementFunction = (date) => date.setDate(date.getDate() + 1);
                revenueFunction = (date) =>
                    this.statisticsService.calculateRevenueDay(
                        date.getDate(),
                        date.getMonth() + 1,
                        date.getFullYear(),
                    );
                break;
            case StatsSplitBy.year:
                refreshCacheKey = `${REVENUE_YEAR}*`;
                dateIncrementFunction = (date) => date.setFullYear(date.getFullYear() + 1);
                revenueFunction = (date) =>
                    this.statisticsService.calculateRevenueYear(date.getFullYear());
                break;
            case StatsSplitBy.month:
            default:
                refreshCacheKey = `${REVENUE_MONTH}*`;
                dateIncrementFunction = (date) => date.setMonth(date.getMonth() + 1);
                revenueFunction = (date) =>
                    this.statisticsService.calculateRevenueMonth(
                        date.getMonth() + 1,
                        date.getFullYear(),
                    );
                break;
        }

        if (refreshCache) {
            const keys = await this.redisService.keys(refreshCacheKey);
            await Promise.all(keys.map((key) => this.redisService.del(key)));
        }

        for (let i = new Date(fromDate); i <= new Date(toDate); dateIncrementFunction(i)) {
            dateRanges.push(new Date(i));
        }

        const dataCalculates = await Promise.all(dateRanges.map(revenueFunction));
        dataCalculates.forEach((revenue, index) => {
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
            result.push({ ...revenue, date: date, dateString: dateString });
        });
        const totalRevenue = dataCalculates.reduce((a, b) => a + b.revenue, 0);
        const totalOrders = dataCalculates.reduce((a, b) => a + b.orders, 0);
        return { totalRevenue, totalOrders, fromDate, toDate, data: result };
    }
}
