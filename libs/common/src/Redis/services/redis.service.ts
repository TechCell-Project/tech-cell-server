import { REDIS_CLIENT } from '~libs/common/constants';
import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Store } from 'cache-manager';

@Injectable()
export class RedisService {
    constructor(
        @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
        @Inject(REDIS_CLIENT) private readonly cacheManager: Store,
    ) {}

    public getClient(): Redis {
        return this.redisClient;
    }

    public getCacheManager(): Store {
        return this.cacheManager;
    }

    public async get<T = string>(key: string): Promise<T | null> {
        const value = await this.redisClient.get(key);
        return value ? (JSON.parse(value) as T) : null;
    }

    /**
     * @param key key of redis to set
     * @param value value of redis to set
     * @param ttl time to live of redis to set (in milliseconds)
     * @returns ok if success
     */
    public async set(
        key: string,
        value: object | string | boolean | number,
        ttl?: number,
    ): Promise<'OK'> {
        const valueString = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
        if (ttl) {
            return this.redisClient.set(key, valueString, 'PX', ttl);
        } else return this.redisClient.set(key, valueString);
    }

    public async del(key: string): Promise<number> {
        return this.redisClient.del(key);
    }

    public async incr(key: string): Promise<number> {
        return this.redisClient.incr(key);
    }

    public async decr(key: string): Promise<number> {
        return this.redisClient.decr(key);
    }

    public async setExpire(key: string, seconds: number): Promise<number> {
        return this.redisClient.expire(key, seconds);
    }

    public async getTtl(key: string): Promise<number> {
        return this.redisClient.ttl(key);
    }

    public async delWithPrefix(prefix: string): Promise<number> {
        const keys = await this.redisClient.keys(prefix);
        if (!keys || keys?.length <= 0) {
            return 0;
        }
        return this.redisClient.del(...keys);
    }

    public async keys(pattern: string): Promise<string[]> {
        return this.redisClient.keys(pattern);
    }
}
