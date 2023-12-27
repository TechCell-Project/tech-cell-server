import { Injectable, Logger } from '@nestjs/common';
import { Once, InjectDiscordClient, On } from '@discord-nestjs/core';
import { Client, TextChannel } from 'discord.js';
import { formatJsonLogsBash, formatJsonLogsDiscord } from '~libs/common/utils';

@Injectable()
export class BotGateway {
    private readonly logger = new Logger(BotGateway.name);
    private readonly serverLogsChannelId: string;
    private readonly serverRequestLogsChannelId: string;

    constructor(
        @InjectDiscordClient()
        private readonly client: Client,
    ) {
        this.serverLogsChannelId = process.env.DISCORD_LOGS_CHANNEL_ID;
        this.serverRequestLogsChannelId = process.env.DISCORD_REQUEST_LOGS_CHANNEL_ID;
    }

    @Once('ready')
    protected onReady() {
        this.logger.log(`Bot ${this.client.user.tag} was started!`);
    }

    @On('warn')
    protected onWarn(message: any) {
        this.logger.warn(message);
    }

    public async writeJsonLogs(message: string) {
        if (!this.serverRequestLogsChannelId) {
            this.logger.warn('[env] DISCORD_REQUEST_LOGS_CHANNEL_ID not found!');
            return;
        }
        const messages = formatJsonLogsDiscord(message);
        if (!messages) {
            return;
        }
        const channel = this.client.channels.cache.get(
            this.serverRequestLogsChannelId,
        ) as TextChannel;
        for (const msg of messages) {
            try {
                await channel.send(msg);
            } catch (error) {
                this.logger.error(error.message);
            }
        }
    }

    public async writeBashLogs(message: string) {
        if (!this.serverLogsChannelId) {
            this.logger.warn('[env] DISCORD_LOGS_CHANNEL_ID not found!');
            return;
        }
        const channel = this.client.channels.cache.get(this.serverLogsChannelId) as TextChannel;
        try {
            await channel.send(formatJsonLogsBash(message));
        } catch (error) {
            this.logger.error(error.message);
        }
    }
}
