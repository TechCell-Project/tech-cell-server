import { Injectable } from '@nestjs/common';
import { StatisticsService } from '~libs/resource/statistics/';
import { TCalculate } from '~libs/resource/statistics/types';
import { KpiService } from '~libs/resource/kpi';
import { GetStatsRequestDTO, GetStatsResponseDTO } from './dtos';
import { StatsSplitBy } from './stats-mnt.enum';

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
        const dataRevenue = [];
        const dateRanges: Date[] = [];

        const day = (date: Date) => date.getDate();
        const month = (date: Date) => date.getMonth() + 1;
        const year = (date: Date) => date.getFullYear();

        let dateIncrementFunction: (date: Date) => void;
        let revenueFunction: (date: Date) => Promise<TCalculate>;
        let dateStringFunction: (date: Date) => string;
        let kpiFunction: (date: Date) => Promise<Array<{ [key: string]: number }>>;

        switch (splitBy) {
            case StatsSplitBy.day:
                dateIncrementFunction = (date) => date.setDate(day(date) + 1);
                dateStringFunction = (date) => `${day(date)}/${month(date)}/${year(date)}`;
                revenueFunction = (date) =>
                    this.statisticsService.calculateRevenueDay(
                        day(date),
                        month(date),
                        year(date),
                        refreshCache,
                    );
                kpiFunction = (date) =>
                    this.kpiService.calculateKpiMonth({ month: month(date), year: year(date) });
                break;
            case StatsSplitBy.year:
                dateIncrementFunction = (date) => date.setFullYear(year(date) + 1);
                dateStringFunction = (date) => `${year(date)}`;
                revenueFunction = (date) =>
                    this.statisticsService.calculateRevenueYear(year(date), refreshCache);
                kpiFunction = (date) => this.kpiService.calculateKpiYear({ year: year(date) });
                break;
            case StatsSplitBy.month:
            default:
                dateIncrementFunction = (date) => date.setMonth(month(date));
                dateStringFunction = (date) => `${month(date)}/${year(date)}`;
                revenueFunction = (date) =>
                    this.statisticsService.calculateRevenueMonth(
                        month(date),
                        year(date),
                        refreshCache,
                    );
                kpiFunction = (date) =>
                    this.kpiService.calculateKpiMonth({ month: month(date), year: year(date) });
                break;
        }

        const kpiRanges = await this.kpiService.calculateKpiOfDateRange({
            fromDate: new Date(fromDate),
            toDate: new Date(toDate),
            refreshCache,
        });

        for (let i = new Date(fromDate); i <= new Date(toDate); dateIncrementFunction(i)) {
            dateRanges.push(new Date(i));
        }

        const revenueCalculates = await Promise.all(dateRanges.map(revenueFunction));
        const kpiCalculates = await Promise.all(dateRanges.map(kpiFunction));

        revenueCalculates.forEach((revenue, index) => {
            const date = dateRanges[index];

            const dataStat = {
                name: dateStringFunction(date),
                ...revenue,
                date: date,
                kpi: {
                    ...Object.assign({}, ...kpiRanges),
                },
            };

            if (kpiCalculates[index]) {
                // Object.assign(dataStat, ...kpiCalculates[index].map((kpi) => kpi));
            }

            dataRevenue.push(dataStat);
        });

        const totalRevenue = revenueCalculates.reduce((a, b) => a + b.revenue, 0);
        const totalOrders = revenueCalculates.reduce((a, b) => a + b.orders, 0);

        return {
            totalRevenue,
            totalOrders,
            fromDate,
            toDate,
            data: dataRevenue,
        } as GetStatsResponseDTO;
    }
}
