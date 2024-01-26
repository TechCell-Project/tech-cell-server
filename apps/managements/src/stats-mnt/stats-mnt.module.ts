import { Module } from '@nestjs/common';
import { StatisticsModule } from '~libs/resource/statistics';
import { StatsMntService } from './stats-mnt.service';
import { RabbitMQService } from '~libs/common/RabbitMQ/services';
import { StatsMntController } from './stats-mnt.controller';
import { RedisModule } from '~libs/common/Redis';

@Module({
    imports: [StatisticsModule, RedisModule],
    controllers: [StatsMntController],
    providers: [StatsMntService, RabbitMQService],
})
export class StatsMntModule {}
