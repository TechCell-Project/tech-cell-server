import { Module } from '@nestjs/common';
import { UtilityController } from './utility.controller';
import { UtilityService } from './utility.service';
import { DiscordModule, AppConfigModule } from '@app/common';
import { RabbitMQService } from '@app/common/RabbitMQ';
import { RedisCacheModule } from '@app/common/RedisCache';
import { UtilityHealthIndicator } from './utility.health';

@Module({
    imports: [AppConfigModule, RedisCacheModule, DiscordModule],
    controllers: [UtilityController],
    providers: [RabbitMQService, UtilityService, UtilityHealthIndicator],
})
export class UtilityModule {}
