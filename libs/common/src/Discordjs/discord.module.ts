import { Module } from '@nestjs/common';
import { DiscordModule as DiscordModuleCore } from '@discord-nestjs/core';
import { GatewayIntentBits } from 'discord.js';
import { BotModule } from './bot';
import { discordToken } from './discord.config';

@Module({
    imports: [
        DiscordModuleCore.forRootAsync({
            useFactory: () => ({
                token: discordToken,
                discordClientOptions: {
                    intents: [
                        GatewayIntentBits.Guilds,
                        GatewayIntentBits.GuildMessages,
                        GatewayIntentBits.DirectMessages,
                        GatewayIntentBits.MessageContent,
                    ],
                },
            }),
        }),
        BotModule,
    ],
    exports: [BotModule],
})
export class DiscordModule {}
