import { REDIS_CACHE } from '@app/common/constants/cache.constant';
import { sleep } from '@app/common/utils/shared.util';
import { Inject, Injectable } from '@nestjs/common';
import { convertTimeString } from 'convert-time-string';
import { RedisStore } from 'cache-manager-redis-yet';
import { promisify } from 'util';

@Injectable()
export class RedisService {
    private readonly redisClient: RedisStore;
    private readonly setnxAsync;
    private readonly pexpireAsync;

    constructor(@Inject(REDIS_CACHE) redisService: RedisStore) {
        this.redisClient = redisService;
    }

    // async acquireLock(key: string, ttl = convertTimeString('3s')): Promise<boolean> {
    //     const retryTimes = 10;

    //     for (let i = 0; i < retryTimes; i++) {
    //         const result = await this.redisService.setnx(key, '1');
    //         if (result === 1) {
    //             await this.redisService.pexpire(key, ttl);
    //             return true;
    //         }
    //         await sleep(200);
    //     }
    //     return false;
    // }

    // async releaseLock(key: string): Promise<void> {
    //     await this.redisService.del(key);
    // }
}
