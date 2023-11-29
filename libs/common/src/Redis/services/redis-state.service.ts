import { REDIS_CLIENT, REDIS_STORE } from '~libs/common/constants';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Store } from 'cache-manager';
import { v4 as uuid } from 'uuid';

@Injectable()
export class RedisStateService implements OnModuleInit {
    private readonly logger = new Logger(RedisStateService.name);
    constructor(
        @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
        @Inject(REDIS_STORE) private readonly cacheManager: Store,
    ) {}

    async onModuleInit() {
        await this.checkRedisConnection();
        await this.checkCacheManagerConnection();
    }

    private async checkRedisConnection() {
        try {
            await this.redisClient.ping();
            this.logger.debug(`[${REDIS_CLIENT}] Redis client connected`);
        } catch (error) {
            this.logger.error(`[${REDIS_CLIENT}] Unable to connect to Redis`, error);
        }
    }

    private async checkCacheManagerConnection() {
        try {
            const dataSet = `test_ping_${Date.now() + uuid()}`;
            await this.cacheManager.set(dataSet, dataSet, 100);
            const dataGet = await this.cacheManager.get<string>(dataSet);
            if (!dataGet) {
                throw new Error('Cache manager not working');
            }
            await this.cacheManager.del(dataSet);
            this.logger.debug(`[${REDIS_STORE}] Cache manager connected: ${dataGet}`);
        } catch (error) {
            this.logger.error(`[${REDIS_STORE}] Unable to connect to cache manager`, error);
        }
    }
}
