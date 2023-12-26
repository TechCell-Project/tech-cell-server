import { Module } from '@nestjs/common';
import { StatisticsModule } from '~libs/resource/statistics';
import { StatsMntService } from './stats-mnt.service';
import { RabbitMQService } from '~libs/common/RabbitMQ/services';
import { StatsMntController } from './stats-mnt.controller';
import { RedisModule } from '~libs/common/Redis';
import { KpiModule } from '~libs/resource/kpi';

@Module({
    imports: [StatisticsModule, RedisModule, KpiModule],
    controllers: [StatsMntController],
    providers: [StatsMntService, RabbitMQService],
})
export class StatsMntModule {}
