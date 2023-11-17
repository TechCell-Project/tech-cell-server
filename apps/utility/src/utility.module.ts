import { Module } from '@nestjs/common';
import { UtilityController } from './utility.controller';
import { UtilityService } from './utility.service';
import { DiscordModule, AppConfigModule } from '~libs/common';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { RedisCacheModule } from '~libs/common/RedisCache';
import { UtilityHealthIndicator } from './utility.health';

@Module({
    imports: [AppConfigModule, RedisCacheModule, DiscordModule],
    controllers: [UtilityController],
    providers: [RabbitMQService, UtilityService, UtilityHealthIndicator],
})
export class UtilityModule {}
