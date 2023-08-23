import { Injectable, Logger } from '@nestjs/common';
import { Once, InjectDiscordClient } from '@discord-nestjs/core';
import { Client, TextChannel } from 'discord.js';

@Injectable()
export class BotGateway {
    private readonly logger = new Logger(BotGateway.name);
    private readonly serverLogsChannelId: string;

    constructor(
        @InjectDiscordClient()
        private readonly client: Client,
    ) {
        this.serverLogsChannelId = process.env.DISCORD_LOGS_CHANNEL_ID;
    }

    @Once('ready')
    onReady() {
        this.logger.log(`Bot ${this.client.user.tag} was started!`);
    }

    async writeLogs(message: any) {
        if (!this.serverLogsChannelId) {
            this.logger.warn('[env] DISCORD_LOGS_CHANNEL_ID not found!');
            return;
        }

        const channel = this.client.channels.cache.get(this.serverLogsChannelId) as TextChannel;
        return await channel.send(message);
    }
}
