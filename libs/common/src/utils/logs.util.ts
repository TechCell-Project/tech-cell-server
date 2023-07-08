import { EmbedBuilder } from 'discord.js';
import { Request, Response } from 'express';

export function formatLogsDiscord(message: string, req: Request, res: Response) {
    const { method } = req;
    const { statusCode } = res;

    let isAppendEmbed = false;

    const messageLogs = {
        content: '```' + message + '```',
    };

    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle(`Method: ${method} | Status Code: ${statusCode}`);

    if (method === 'GET') {
        if (req.query && Object.keys(req?.query) && Object.keys(req?.query).length > 0) {
            isAppendEmbed = true;
            embed.addFields({
                name: 'Query',
                value: '```json\n' + JSON.stringify(req.query, null, 2) + '\n```',
            });
        }
    } else {
        if (req.query && Object.keys(req?.body) && Object.keys(req?.body).length > 0) {
            isAppendEmbed = true;
            embed.addFields({
                name: 'Body',
                value: '```json\n' + JSON.stringify(req.body, null, 2) + '\n```',
            });
        }
    }

    if (isAppendEmbed) Object.assign(messageLogs, { embeds: [embed] });

    return messageLogs;
}
