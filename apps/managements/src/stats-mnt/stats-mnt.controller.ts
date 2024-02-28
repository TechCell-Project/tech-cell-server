import { Inject } from '@nestjs/common';
import { Ctx, Payload, RmqContext, MessagePattern } from '@nestjs/microservices';
import { RabbitMQService } from '~libs/common/RabbitMQ/services';
import { StatsMntService } from './stats-mnt.service';
import { StatsMntMessagePattern } from './stats-mnt.pattern';
import { GetStatsRequestDTO } from './dtos';
import { GetStatsOrdersApiRequestDTO } from './dtos/get-stats-orders-request.2.dto';

export class StatsMntController {
    constructor(
        @Inject(RabbitMQService) private readonly rabbitMqService: RabbitMQService,
        private readonly statsMntService: StatsMntService,
    ) {}

    @MessagePattern(StatsMntMessagePattern.getStats)
    async getStats(@Ctx() context: RmqContext, @Payload() query: GetStatsRequestDTO) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.statsMntService.getStats({ ...query });
    }

    @MessagePattern(StatsMntMessagePattern.getStatsOrders)
    async getStatsOrders(
        @Ctx() context: RmqContext,
        @Payload() query: GetStatsOrdersApiRequestDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.statsMntService.getStatsOrders({ ...query });
    }
}
