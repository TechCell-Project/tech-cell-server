import { Command, Handler } from '@discord-nestjs/core';
import { CommandInteraction } from 'discord.js';
import { Injectable } from '@nestjs/common';

@Command({
    name: 'playlist',
    description: 'Get current playlist',
})
@Injectable()
export class PlaylistCommand {
    @Handler()
    onPlaylist(interaction: CommandInteraction): string {
        return 'List with music...';
    }
}
