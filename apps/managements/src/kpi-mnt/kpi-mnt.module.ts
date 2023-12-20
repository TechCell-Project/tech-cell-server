import { Module } from '@nestjs/common';
import { KpiMntService } from './kpi-mnt.service';
import { KpiMntController } from './kpi-mnt.controller';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { KpiModule } from '~libs/resource/kpi';

@Module({
    imports: [KpiModule],
    controllers: [KpiMntController],
    providers: [KpiMntService, RabbitMQService],
})
export class KpiMntModule {}
