import { Injectable } from '@nestjs/common';
import { KpiRepository } from './kpi.repository';
import { Kpi } from './schemas';
import { ClientSession } from 'mongoose';

@Injectable()
export class KpiService {
    constructor(private readonly kpiRepository: KpiRepository) {}

    async createKpi(data: Kpi, session?: ClientSession): Promise<Kpi> {
        return this.kpiRepository.create(data, undefined, session);
    }
}
