import { Logger } from '@nestjs/common';
import { AbstractRepository } from '../abstract';
import { Kpi } from './schemas/kpi.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

export class KpiRepository extends AbstractRepository<Kpi> {
    protected readonly logger = new Logger(KpiRepository.name);

    constructor(
        @InjectModel(Kpi.name) protected readonly kpiModel: Model<Kpi>,
        @InjectConnection() connection: Connection,
    ) {
        super(kpiModel, connection);
    }

    async findKpiByType(kpiType: string): Promise<Kpi> {
        return this.findOne({ kpiType: kpiType });
    }

    async findKpiByTypeAndDate(kpiType: string, startDate: Date, endDate: Date): Promise<Kpi> {
        return this.findOne({ kpiType: kpiType, startDate: startDate, endDate: endDate });
    }
}
