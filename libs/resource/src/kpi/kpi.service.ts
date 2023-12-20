import { ConflictException, Injectable } from '@nestjs/common';
import { KpiRepository } from './kpi.repository';
import { Kpi } from './schemas';
import { ClientSession, FilterQuery, ProjectionType, QueryOptions, Types } from 'mongoose';
import { KpiDTO } from './dtos';
import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '~libs/common/i18n/generated/i18n.generated';

@Injectable()
export class KpiService {
    constructor(private readonly kpiRepository: KpiRepository) {}

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
}
