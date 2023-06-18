import { Controller, Get, Inject } from '@nestjs/common';
import { SampleService } from './sample.service';
import { RabbitMQService } from '@app/common';
import { Ctx, RmqContext, MessagePattern } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { REDIS_CACHE } from '~/constants';

@Controller()
export class SampleController {
    constructor(
        private readonly sampleService: SampleService,
        @Inject(RabbitMQService) private readonly rabbitMqService: RabbitMQService,
        @Inject(REDIS_CACHE) private cacheManager: Cache,
    ) {}

    private count = 0;
    @Get('ping')
    async getPing() {
        this.count++;
        await this.cacheManager.set(`key ${this.count}`, `value ${this.count}`);
        return this.sampleService.getPing();
    }

    @MessagePattern('get_sample')
    async getSample(@Ctx() context: RmqContext) {
        this.rabbitMqService.acknowledgeMessage(context);
        return { message: 'hello from sample' };
    }

    @MessagePattern('get_sample_auth')
    async getSampleAuth(@Ctx() context: RmqContext) {
        this.rabbitMqService.acknowledgeMessage(context);
        return { message: 'you only see this if you already auth success' };
    }
}
