import { Injectable } from '@nestjs/common';
import { StatisticsService } from '~libs/resource/statistics/';
import { TCalculate } from '~libs/resource/statistics/types';
import { KpiDTO, KpiService, KpiStatusEnum, KpiTypeEnum } from '~libs/resource/kpi';
import { GetStatsRequestDTO, GetStatsResponseDTO } from './dtos';
import { StatsSplitBy } from './stats-mnt.enum';
import { calculateDaysBetweenDates } from '~libs/common/utils/shared.util';

@Injectable()
export class StatsMntService {
    constructor(
        private readonly statisticsService: StatisticsService,
        private readonly kpiService: KpiService,
    ) {}

    async getStats({
        fromDate,
        toDate = new Date().toString(),
        splitBy,
        refreshCache,
    }: GetStatsRequestDTO): Promise<GetStatsResponseDTO> {
        const result = [];
        const dateRanges: Date[] = [];
        let dateIncrementFunction: (date: Date) => void;
        let revenueFunction: (date: Date) => Promise<TCalculate>;
        // const kpiRevenueFunction = (fromDate: string, toDate: string) =>
        //     this.resolveKpi({ fromDate, toDate, splitBy });

        switch (splitBy) {
            case StatsSplitBy.day:
                dateIncrementFunction = (date) => date.setDate(date.getDate() + 1);
                revenueFunction = (date) =>
                    this.statisticsService.calculateRevenueDay(
                        date.getDate(),
                        date.getMonth() + 1,
                        date.getFullYear(),
                        refreshCache,
                    );
                break;
            case StatsSplitBy.year:
                dateIncrementFunction = (date) => date.setFullYear(date.getFullYear() + 1);
                revenueFunction = (date) =>
                    this.statisticsService.calculateRevenueYear(date.getFullYear(), refreshCache);
                break;
            case StatsSplitBy.month:
            default:
                dateIncrementFunction = (date) => date.setMonth(date.getMonth() + 1);
                revenueFunction = (date) =>
                    this.statisticsService.calculateRevenueMonth(
                        date.getMonth() + 1,
                        date.getFullYear(),
                        refreshCache,
                    );
                break;
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
        const kpis = await this.resolveKpi({ fromDate, toDate, splitBy });
        return {
            totalRevenue,
            totalOrders,
            fromDate,
            toDate,
            data: result,
            ...Object.fromEntries(kpis),
        };
    }

    private async resolveKpi(dataResolve: GetStatsRequestDTO): Promise<Map<string, number>> {
        const { fromDate, toDate, splitBy } = dataResolve;
        const kpiType = KpiTypeEnum.revenue;
        const kpis = await this.kpiService.getKpisOrNull({
            filterQuery: {
                kpiType: kpiType,
                kpiStatus: KpiStatusEnum.active,
                $or: [
                    { startDate: { $gte: new Date(fromDate) } },
                    { endDate: { $lte: new Date(toDate) } },
                ],
            },
        });

        const mapKpi = new Map<string, number>();
        kpis.forEach((kpi: KpiDTO) => {
            const { name, value, startDate, endDate } = kpi;
            const numsOfDays = calculateDaysBetweenDates(startDate, endDate);
            const valuePerDay = value / numsOfDays;

            switch (splitBy) {
                case StatsSplitBy.month:
                    mapKpi.set(name, valuePerDay * 30);
                    break;
                case StatsSplitBy.year:
                    mapKpi.set(name, valuePerDay * 365);
                    break;
                case StatsSplitBy.day:
                default:
                    mapKpi.set(name, valuePerDay);
                    break;
            }
        });

        return mapKpi;
    }
}
