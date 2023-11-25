import { Inject, Injectable } from '@nestjs/common';
import { REDIS_STORE } from '~libs/common/constants';
import { Store } from 'cache-manager';
import * as path from 'path';
import * as fs from 'fs/promises';
import { LogType } from './enums';
import { BotGateway } from '~libs/common/Discordjs/bot';
import { dateToString } from '~libs/common/utils/shared.util';

@Injectable()
export class UtilityService {
    constructor(
        @Inject(REDIS_STORE) private cacheManager: Store,
        private readonly botGateway: BotGateway,
    ) {}

    async writeLogsToFile(message: string, type: LogType) {
        let logDirectory: string;
        switch (type) {
            case 'http':
                logDirectory = path.join(__dirname, `../../../logs/http-logs/`);
                break;
            case 'other':
            default:
                logDirectory = path.join(__dirname, `../../../logs/other-logs/`);
                break;
        }
        await fs.mkdir(logDirectory, { recursive: true });

        const fileName = `logs_${dateToString()}.log`;

        const dataToWrite = message.trim() + '\n';
        return await fs.writeFile(path.join(logDirectory, fileName), dataToWrite, {
            flag: 'a',
        });
    }

    async writeLogsToDiscord(message: any) {
        return await this.botGateway.writeLogs(message);
    }
}
