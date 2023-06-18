import { Controller, Get, Inject, Post } from '@nestjs/common';
import { SampleService } from './sample.service';
import { RabbitMQService } from '@app/common';
import { Ctx, RmqContext, MessagePattern } from '@nestjs/microservices';

@Controller()
export class SampleController {
    constructor(
        private readonly sampleService: SampleService,
        @Inject(RabbitMQService) private readonly rabbitMqService: RabbitMQService,
    ) {}

    @Get('ping')
    async getPing() {
        return this.sampleService.getPing();
    }

    @Post('cache')
    async setCache() {
        return this.sampleService.setCacheNumber();
    }

    @Get('cache')
    async getCache() {
        return this.sampleService.getCacheNumber();
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
