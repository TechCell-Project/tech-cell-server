import { Logger } from '@nestjs/common';
import { MAX_DISCORD_BODY_LENGTH } from '~libs/common/constants/common.constant';

/**
 * @description Format JSON string to array of messages that can be sent to discord
 * @param message - JSON string message
 * @returns Array of messages that can be sent to discord
 */
export function formatJsonLogsDiscord(message: string): Array<{ content: string }> {
    try {
        const jsonData = JSON.parse(message);
        const stringData = JSON.stringify(jsonData, null, 2);
        const messageLength = stringData.length;

        if (messageLength < MAX_DISCORD_BODY_LENGTH) {
            return [
                {
                    content: '```json\n' + stringData + '\n```',
                },
            ];
        }

        // Split json data into multiple messages if it is too long
        const messages = [];
        let msg = {};
        let lengthCount = 0;
        for (const [key, value] of Object.entries(jsonData)) {
            const stringPair = JSON.stringify({ [key]: value }, null, 2);
            const pairLength = stringPair.length;
            if (lengthCount + pairLength >= MAX_DISCORD_BODY_LENGTH) {
                messages.push({
                    content: '```json\n' + JSON.stringify(msg, null, 2) + '\n```',
                });
                msg = {};
                lengthCount = 0;
            }
            Object.assign(msg, { [key]: value });
            lengthCount += pairLength;
        }
        messages.push({
            content: '```json\n' + JSON.stringify(msg, null, 2) + '\n```',
        });

        return messages;
    } catch (error) {
        Logger.error(error);
        return null;
    }
}
