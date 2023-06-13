import { Controller, Get, Inject } from '@nestjs/common';
import { SampleService } from './sample.service';
import { RabbitMQService } from '@app/common';
import { Ctx, Payload, RmqContext, MessagePattern } from '@nestjs/microservices';

@Controller()
export class SampleController {
    constructor(
        private readonly sampleService: SampleService,
        @Inject(RabbitMQService) private readonly rabbitMqService: RabbitMQService,
    ) {}

    @Get('ping')
    getPing() {
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
