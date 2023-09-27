import { Module } from '@nestjs/common';
import { UtilityController } from './utility.controller';
import { UtilityService } from './utility.service';
import { RabbitMQService, DiscordModule, AppConfigModule, RedisCacheModule } from '@app/common';

@Module({
    imports: [AppConfigModule, RedisCacheModule, DiscordModule],
    controllers: [UtilityController],
    providers: [RabbitMQService, UtilityService],
})
export class UtilityModule {}
