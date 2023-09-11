import { Injectable, Logger } from '@nestjs/common';
import { Once, InjectDiscordClient } from '@discord-nestjs/core';
import { Client, TextChannel } from 'discord.js';
import { formatJsonLogsDiscord } from '@app/common/utils';

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

    async writeLogs(message: string) {
        if (!this.serverLogsChannelId) {
            this.logger.warn('[env] DISCORD_LOGS_CHANNEL_ID not found!');
            return;
        }
        const messages = formatJsonLogsDiscord(message);
        if (!messages) {
            return;
        }
        const channel = this.client.channels.cache.get(this.serverLogsChannelId) as TextChannel;
        for (const msg of messages) {
            await channel.send(msg);
        }
    }
}
