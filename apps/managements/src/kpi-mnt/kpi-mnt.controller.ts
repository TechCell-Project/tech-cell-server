import { Controller } from '@nestjs/common';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { KpiMntService } from './kpi-mnt.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { KpiMntMessagePattern } from './kpi-mnt.pattern';
import {
    CreateKpiRequestDTO,
    GetKpisRequestDTO,
    ListKpisResponseDTO,
    UpdateKpiRequestDTO,
} from './dtos';
import { KpiDTO } from '~libs/resource/kpi/dtos';
import { ObjectIdParamDTO } from '~libs/common/dtos';

@Controller('kpi-mnt')
export class KpiMntController {
    constructor(
        private readonly rabbitMqService: RabbitMQService,
        private readonly kpiMntService: KpiMntService,
    ) {}

    @MessagePattern(KpiMntMessagePattern.createKpi)
    async createKpi(
        @Ctx() context: RmqContext,
        @Payload() data: CreateKpiRequestDTO,
    ): Promise<KpiDTO> {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.kpiMntService.createKpi(data);
    }

    @MessagePattern(KpiMntMessagePattern.getKpis)
    async getKpis(
        @Ctx() context: RmqContext,
        @Payload() data: GetKpisRequestDTO,
    ): Promise<ListKpisResponseDTO> {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.kpiMntService.getKpis(data);
    }

    @MessagePattern(KpiMntMessagePattern.getKpiById)
    async getKpiById(
        @Ctx() context: RmqContext,
        @Payload() { id }: ObjectIdParamDTO,
    ): Promise<KpiDTO> {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.kpiMntService.getKpiById({ id });
    }

    @MessagePattern(KpiMntMessagePattern.updateKpi)
    async updateKpi(
        @Ctx() context: RmqContext,
        @Payload() data: UpdateKpiRequestDTO & ObjectIdParamDTO,
    ): Promise<KpiDTO> {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.kpiMntService.updateKpi(data);
    }
}
