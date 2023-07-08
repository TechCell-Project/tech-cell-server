import { Module } from '@nestjs/common';
import { DiscordModule } from '@discord-nestjs/core';
import { BotGateway } from './bot.gateway';

@Module({
    imports: [DiscordModule.forFeature()],
    providers: [BotGateway],
    exports: [BotGateway],
})
export class BotModule {}
