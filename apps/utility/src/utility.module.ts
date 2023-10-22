import { Module } from '@nestjs/common';
import { UtilityController } from './utility.controller';
import { UtilityService } from './utility.service';
import { DiscordModule, AppConfigModule } from '@app/common';
import { RabbitMQService } from '@app/common/RabbitMQ';
import { RedisCacheModule } from '@app/common/RedisCache';

@Module({
    imports: [AppConfigModule, RedisCacheModule, DiscordModule],
    controllers: [UtilityController],
    providers: [RabbitMQService, UtilityService],
})
export class UtilityModule {}
