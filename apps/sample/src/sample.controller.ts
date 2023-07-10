import { Controller, Get, Inject, Post } from '@nestjs/common';
import { SampleService } from './sample.service';
import { SampleMessagePattern, SampleEventPattern } from './sample.pattern';
import { RabbitMQService } from '@app/common';
import { Ctx, RmqContext, MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { BotGateway } from '@app/common/Discordjs/bot/bot.gateway';

@Controller()
export class SampleController {
    constructor(
        private readonly sampleService: SampleService,
        @Inject(RabbitMQService) private readonly rabbitMqService: RabbitMQService,
        private readonly botGateway: BotGateway,
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

    @MessagePattern(SampleMessagePattern.getSample)
    async getSample(@Ctx() context: RmqContext) {
        this.rabbitMqService.acknowledgeMessage(context);
        return { message: 'hello from sample' };
    }

    @MessagePattern(SampleMessagePattern.getSampleAuth)
    async getSampleAuth(@Ctx() context: RmqContext) {
        this.rabbitMqService.acknowledgeMessage(context);
        return { message: 'you only see this if you already auth success' };
    }

    @EventPattern(SampleEventPattern.writeLogsToDiscord)
    async writeLogsToDiscord(@Ctx() context: RmqContext, @Payload() { message }: { message: any }) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.botGateway.writeLogs(message);
    }
}
