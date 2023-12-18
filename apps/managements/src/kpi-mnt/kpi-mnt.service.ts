import { Injectable } from '@nestjs/common';
import { KpiDTO, KpiService } from '~libs/resource/kpi';
import {
    CreateKpiRequestDTO,
    GetKpisRequestDTO,
    ListKpisResponseDTO,
    UpdateKpiRequestDTO,
} from './dtos';
import { Types } from 'mongoose';
import { ObjectIdParamDTO, PaginationQuery } from '~libs/common/dtos';

@Injectable()
export class KpiMntService {
    constructor(private readonly kpiService: KpiService) {}

    async createKpi(data: CreateKpiRequestDTO): Promise<KpiDTO> {
        return this.kpiService.createKpi({
            _id: new Types.ObjectId(),
            ...data,
        });
    }

    async getKpis(data: GetKpisRequestDTO): Promise<ListKpisResponseDTO> {
        const { page, pageSize } = new PaginationQuery(data);
        const { name, kpiType, startDate, endDate } = data;

        const filters = {
            ...(name && { name }),
            ...(kpiType && { kpiType }),
            ...(startDate && { startDate: new Date(startDate) }),
            ...(endDate && { endDate: new Date(endDate) }),
        };

        const [kpis, totalRecord] = await Promise.all([
            this.kpiService.getKpis({
                filterQuery: filters,
                queryOptions: {
                    skip: (page - 1) * pageSize,
                    limit: pageSize,
                },
            }),
            this.kpiService.countKpis(filters),
        ]);

        return new ListKpisResponseDTO({
            page,
            pageSize,
            data: kpis,
            totalRecord,
            totalPage: Math.ceil(totalRecord / pageSize),
        });
    }

    async updateKpi(data: UpdateKpiRequestDTO & ObjectIdParamDTO): Promise<KpiDTO> {
        const { id, name, startDate, endDate, value, kpiStatus } = data;
        return this.kpiService.updateKpi(id, { name, startDate, endDate, value, kpiStatus });
    }

    async getKpiById({ id }: ObjectIdParamDTO): Promise<KpiDTO> {
        return this.kpiService.getKpiById(id);
    }
}
