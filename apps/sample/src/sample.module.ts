import { Module } from '@nestjs/common';
import { SampleController } from './sample.controller';
import { SampleService } from './sample.service';
import { RabbitMQService, DiscordModule, AppConfigModule, RedisCacheModule } from '@app/common';

@Module({
    imports: [AppConfigModule, RedisCacheModule, DiscordModule],
    controllers: [SampleController],
    providers: [RabbitMQService, SampleService],
})
export class SampleModule {}
