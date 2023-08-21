import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CACHE } from '~/constants';
import { Store } from 'cache-manager';
import * as path from 'path';
import * as fs from 'fs';
import { LogType } from '../enums';

@Injectable()
export class SampleService {
    constructor(@Inject(REDIS_CACHE) private cacheManager: Store) {}

    private cacheSampleNumber = 0;

    getPing() {
        return { message: 'Pong' };
    }

    setCacheNumber() {
        this.cacheSampleNumber++;

        // set cache sample number with ttl is 60 seconds
        this.cacheManager.set(
            `sample_cache_num_key_${this.cacheSampleNumber}`,
            `sample_cache_num_value_${this.cacheSampleNumber}`,
            1000 * 60,
        );
        return {
            message: 'set successfully',
            key: `sample_cache_num_key_${this.cacheSampleNumber}`,
            value: `sample_cache_num_value_${this.cacheSampleNumber}`,
        };
    }

    getCacheNumber() {
        // get the previous cache
        const cacheKey = `sample_cache_num_key_${this.cacheSampleNumber--}`;
        return {
            key: cacheKey,
            value: this.cacheManager.get(cacheKey),
        };
    }

    async writeLogsToFile(message: string, type: LogType) {
        let logDirectory = '';
        switch (type) {
            case 'http':
                logDirectory = path.join(__dirname, `../../../logs/http-logs/`);
                break;
            case 'other':
            default:
                logDirectory = path.join(__dirname, `../../../logs/other-logs/`);
                break;
        }
        fs.mkdirSync(logDirectory, { recursive: true });

        const currentDate = new Date();
        const day = currentDate.getDate().toString().padStart(2, '0');
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const year = currentDate.getFullYear().toString();
        const fileName = `logs_${day}-${month}-${year}.log`;

        const logStream = fs.createWriteStream(path.join(logDirectory, fileName), {
            flags: 'a',
        });

        return logStream.write(message.trim() + '\n');
    }
}
