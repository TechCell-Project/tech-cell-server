import { ConflictException, Injectable } from '@nestjs/common';
import { KpiRepository } from './kpi.repository';
import { Kpi } from './schemas';
import { ClientSession, FilterQuery, ProjectionType, QueryOptions, Types } from 'mongoose';
import { KpiDTO } from './dtos';
import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '~libs/common/i18n/generated/i18n.generated';
import { RedisService } from '~libs/common/Redis';
import {
    KPI_CACHE_PREFIX,
    KPI_DAY,
    KPI_MONTH,
    KPI_YEAR,
    calculateDaysBetweenDates,
} from '~libs/common';
import { KpiStatusEnum } from './enums';
import { convertTimeString } from 'convert-time-string';

@Injectable()
export class KpiService {
    constructor(
        private readonly kpiRepository: KpiRepository,
        private readonly redisCache: RedisService,
    ) {}

    async createKpi(data: KpiDTO, session?: ClientSession): Promise<Kpi | KpiDTO> {
        data.name = data.name.trim().toLowerCase();
        const isKpiExist = await this.kpiRepository.getKpiByNameAndType({
            name: data.name,
            kpiType: data.kpiType,
        });

        if (isKpiExist) {
            throw new ConflictException(
                I18nContext.current<I18nTranslations>().t('errorMessage.PROPERTY_LABEL_IS_EXISTS', {
                    args: {
                        property: data.kpiType,
                        label: data.name,
                    },
                }),
            );
        }

        if (data.startDate >= data.endDate) {
            throw new ConflictException(
                I18nContext.current<I18nTranslations>().t(
                    'errorMessage.START_DATE_MUST_BE_BEFORE_END_DATE',
                ),
            );
        }

        return this.kpiRepository.create(
            {
                ...data,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                ...(data.createdAt && { createdAt: new Date(data.createdAt) }),
                ...(data.updatedAt && { updatedAt: new Date(data.updatedAt) }),
            },
            undefined,
            session,
        );
    }

    async getKpiById(id: string | Types.ObjectId) {
        const idFind = id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
        return this.kpiRepository.findOne({ _id: idFind });
    }

    async getKpisByDateRange(startDate: Date, endDate: Date) {
        return this.kpiRepository.find({
            filterQuery: {
                startDate: { $gte: startDate },
                endDate: { $lte: endDate },
            },
        });
    }

    async getKpiByType(kpiType: string) {
        return this.kpiRepository.getKpiByType(kpiType);
    }

    async getKpis({
        filterQuery,
        queryOptions,
        projection,
        logEnabled = true,
    }: {
        filterQuery: FilterQuery<Kpi>;
        queryOptions?: Partial<QueryOptions<Kpi>>;
        projection?: ProjectionType<Kpi>;
        logEnabled?: boolean;
    }) {
        return this.kpiRepository.find({
            filterQuery,
            queryOptions,
            projection,
            logEnabled,
        });
    }

    async getKpisOrNull({
        filterQuery,
        queryOptions,
        projection,
        logEnabled = true,
    }: {
        filterQuery: FilterQuery<Kpi>;
        queryOptions?: Partial<QueryOptions<Kpi>>;
        projection?: ProjectionType<Kpi>;
        logEnabled?: boolean;
    }) {
        try {
            const kpis = await this.kpiRepository.find({
                filterQuery,
                queryOptions,
                projection,
                logEnabled,
            });
            return kpis;
        } catch (error) {
            return null;
        }
    }

    async countKpis(filterQuery: FilterQuery<Kpi>) {
        return this.kpiRepository.count(filterQuery);
    }

    async updateKpi(id: string | Types.ObjectId, newData: Partial<KpiDTO>) {
        const idFind = id instanceof Types.ObjectId ? id : new Types.ObjectId(id);

        const oldKpi = await this.kpiRepository.findOne({ _id: idFind });

        if (newData?.name) {
            newData.name = newData.name.trim().toLowerCase();
            const isKpiExist = await this.kpiRepository.getKpiByNameOrNull(newData.name);
            if (isKpiExist) {
                throw new ConflictException(
                    I18nContext.current<I18nTranslations>().t(
                        'errorMessage.PROPERTY_LABEL_IS_EXISTS',
                        {
                            args: {
                                property: 'name',
                                label: newData.name,
                            },
                        },
                    ),
                );
            }
        }

        if (newData?.startDate && newData?.endDate) {
            if (new Date(newData.startDate) >= new Date(newData.endDate)) {
                throw new ConflictException(
                    I18nContext.current<I18nTranslations>().t(
                        'errorMessage.START_DATE_MUST_BE_BEFORE_END_DATE',
                    ),
                );
            }
        }

        if (newData?.startDate && !newData?.endDate) {
            if (new Date(newData.startDate) >= oldKpi.endDate) {
                throw new ConflictException(
                    I18nContext.current<I18nTranslations>().t(
                        'errorMessage.START_DATE_MUST_BE_BEFORE_END_DATE',
                    ),
                );
            }
        }

        if (!newData?.startDate && newData?.endDate) {
            if (oldKpi.startDate >= new Date(newData.endDate)) {
                throw new ConflictException(
                    I18nContext.current<I18nTranslations>().t(
                        'errorMessage.START_DATE_MUST_BE_BEFORE_END_DATE',
                    ),
                );
            }
        }

        return this.kpiRepository.findOneAndUpdate(
            { _id: idFind },
            {
                ...newData,
                ...(newData.startDate && { startDate: new Date(newData.startDate) }),
                ...(newData.endDate && { endDate: new Date(newData.endDate) }),
            },
        );
    }

    async calculateKpiDay({
        day,
        month,
        year,
        refreshCache = false,
    }: {
        day: number;
        month: number;
        year: number;
        refreshCache?: boolean;
    }) {
        const cacheKey = `${KPI_DAY}_${year}_${month}_${day}`;

        if (refreshCache) {
            await this.redisCache.del(cacheKey);
        }
        const specificDate = new Date(year, month - 1, day).toISOString();
        const kpis: Kpi[] | null = await this.kpiRepository.findOrNull({
            filterQuery: {
                kpiStatus: KpiStatusEnum.active,
                $and: [{ startDate: { $lte: specificDate } }, { endDate: { $gte: specificDate } }],
            },
        });

        const kpiDays = kpis?.map((kpi) => {
            const diffDays = calculateDaysBetweenDates(kpi.startDate, kpi.endDate);
            const kpiPerDay = kpi.value / diffDays;
            kpi.value = kpiPerDay;
            return { [kpi.name]: kpiPerDay };
        });

        return kpiDays;
    }
    async calculateKpiMonth({
        month,
        year,
        refreshCache = false,
    }: {
        month: number;
        year: number;
        refreshCache?: boolean;
    }) {
        const cacheKey = `${KPI_MONTH}_${year}_${month}`;

        if (refreshCache) {
            await this.redisCache.del(cacheKey);
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const kpis: Kpi[] | null = await this.kpiRepository.findOrNull({
            filterQuery: {
                kpiStatus: KpiStatusEnum.active,
                $or: [{ startDate: { $lte: startDate } }, { endDate: { $gte: endDate } }],
            },
        });

        const kpiMonths = kpis?.map((kpi) => {
            const diffDays = calculateDaysBetweenDates(kpi.startDate, kpi.endDate);
            const diffMonths = Math.ceil(diffDays / new Date(year, month, 0).getDate());
            const kpiPerMonth = kpi.value / diffMonths;
            kpi.value = kpiPerMonth;
            return { [kpi.name]: kpiPerMonth };
        });

        return kpiMonths;
    }

    async calculateKpiYear({
        year,
        refreshCache = false,
    }: {
        year: number;
        refreshCache?: boolean;
    }): Promise<Array<{ [key: string]: number }>> {
        const cacheKey = `${KPI_YEAR}_${year}`;

        if (refreshCache) {
            await this.redisCache.del(cacheKey);
        }

        const startDate = new Date(year, 0, 1).toISOString();
        const endDate = new Date(year + 1, 0, 0).toISOString();
        const kpis: Kpi[] | null = await this.kpiRepository.findOrNull({
            filterQuery: {
                kpiStatus: KpiStatusEnum.active,
                $or: [{ startDate: { $lte: startDate } }, { endDate: { $gte: endDate } }],
            },
        });

        const kpiYears = kpis?.map((kpi) => {
            const diffDays = calculateDaysBetweenDates(kpi.startDate, kpi.endDate);
            const diffYears = Math.ceil(diffDays / new Date(year, 0, 0).getDate());
            const kpiPerYear = kpi.value / diffYears;
            kpi.value = kpiPerYear;
            return { [kpi.name]: kpiPerYear };
        });

        return kpiYears;
    }

    async calculateKpiOfDateRange({
        fromDate,
        toDate,
        refreshCache = false,
    }: {
        fromDate: Date;
        toDate: Date;
        refreshCache?: boolean;
    }) {
        const cacheKey = `${KPI_CACHE_PREFIX}_RANGE_${fromDate}_${toDate}`;

        if (refreshCache) {
            await this.redisCache.del(cacheKey);
        }

        const kpis: Kpi[] | null = await this.kpiRepository.findOrNull({
            filterQuery: {
                kpiStatus: KpiStatusEnum.active,
                $or: [{ startDate: { $lte: fromDate } }, { endDate: { $gte: toDate } }],
            },
        });

        const kpiOfDateRange = kpis?.map((kpi) => {
            const diffDays = calculateDaysBetweenDates(kpi.startDate, kpi.endDate);
            const diffDateRange = calculateDaysBetweenDates(fromDate, toDate);
            const kpiOfDateRange = (kpi.value / diffDays) * diffDateRange;
            kpi.value = kpiOfDateRange;
            return { [kpi.name]: kpiOfDateRange };
        });

        await this.redisCache.set(cacheKey, kpiOfDateRange, convertTimeString('1h'));

        return kpiOfDateRange;
    }
}
