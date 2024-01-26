import { Module } from '@nestjs/common';
import { UtilityController } from './utility.controller';
import { UtilityService } from './utility.service';
import { DiscordModule, AppConfigModule } from '~libs/common';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { UtilityHealthIndicator } from './utility.health';
import { RedisModule } from '~libs/common/Redis/redis.module';
import { I18nModule } from '~libs/common/i18n/i18n.module';

@Module({
    imports: [AppConfigModule, I18nModule, RedisModule, DiscordModule],
    controllers: [UtilityController],
    providers: [RabbitMQService, UtilityService, UtilityHealthIndicator],
})
export class UtilityModule {}
