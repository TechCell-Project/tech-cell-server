import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { SampleService } from './sample.service';
import { RabbitMQService } from '@app/common';
import { Ctx, RmqContext, MessagePattern, Payload } from '@nestjs/microservices';
import { InjectDiscordClient } from '@discord-nestjs/core';
import { Client, TextChannel } from 'discord.js';
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

    @MessagePattern({ cmd: 'write_logs_to_discord' })
    async writeLogsToDiscord(
        @Ctx() context: RmqContext,
        @Payload() { message }: { message: string },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.botGateway.writeLogs(`\`\`\` ${message} \`\`\``);
    }

    @Get('msg')
    async writeLogsToDiscordms(@Body() body: any) {
        this.botGateway.writeLogs(JSON.stringify(body));
        return { message: 'hello from discord' };
    }
}
