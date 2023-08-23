import { Module } from '@nestjs/common';
import { DiscordModule as DiscordModuleCore } from '@discord-nestjs/core';
import { GatewayIntentBits } from 'discord.js';
import { BotModule } from './bot';

@Module({
    imports: [
        DiscordModuleCore.forRootAsync({
            useFactory: () => ({
                token: process.env.DISCORD_TOKEN,
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
