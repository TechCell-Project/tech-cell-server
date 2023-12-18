import { Logger } from '@nestjs/common';
import { AbstractRepository } from '../abstract';
import { Kpi } from './schemas/kpi.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { KpiDTO } from './dtos';

export class KpiRepository extends AbstractRepository<Kpi> {
    protected readonly logger = new Logger(KpiRepository.name);

    constructor(
        @InjectModel(Kpi.name) protected readonly kpiModel: Model<Kpi>,
        @InjectConnection() connection: Connection,
    ) {
        super(kpiModel, connection);
    }

    async getKpiByNameOrNull(name: string): Promise<Kpi | null> {
        try {
            const result = await this.findOne({ name: name });
            return result;
        } catch (error) {
            return null;
        }
    }

    async getKpiByType(kpiType: string): Promise<Kpi> {
        return this.findOne({ kpiType: kpiType });
    }

    async getKpiByNameAndType({
        name,
        kpiType,
    }: Pick<KpiDTO, 'name' | 'kpiType'>): Promise<Kpi | null> {
        return this.findOneOrNull({ name, kpiType });
    }

    async getKpiByTypeAndDate(kpiType: string, startDate: Date, endDate: Date): Promise<Kpi> {
        return this.findOne({ kpiType: kpiType, startDate: startDate, endDate: endDate });
    }

    async getKpisByDateRange(startDate: Date, endDate: Date): Promise<Kpi[]> {
        return this.find({
            filterQuery: {
                startDate: { $gte: startDate },
                endDate: { $lte: endDate },
            },
        });
    }

    async getKpisBySelectDate(selectDate: Date): Promise<Kpi[]> {
        return this.find({
            filterQuery: {
                startDate: { $lte: selectDate },
                endDate: { $gte: selectDate },
            },
        });
    }
}
