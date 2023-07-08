import { Injectable, Logger } from '@nestjs/common';
import { Once, InjectDiscordClient } from '@discord-nestjs/core';
import { Client, TextChannel } from 'discord.js';
import { configChannelId } from '../discord.config';

@Injectable()
export class BotGateway {
    private readonly logger = new Logger(BotGateway.name);

    constructor(
        @InjectDiscordClient()
        private readonly client: Client,
    ) {}

    @Once('ready')
    onReady() {
        this.logger.log(`Bot ${this.client.user.tag} was started!`);
    }

    async writeLogs(message: any) {
        const channel = this.client.channels.cache.get(configChannelId.serverLogs) as TextChannel;
        return await channel.send(message);
    }
}
