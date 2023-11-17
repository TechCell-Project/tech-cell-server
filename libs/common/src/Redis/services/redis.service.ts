import { REDIS_CLIENT } from '~libs/common/constants';
import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
    constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

    public getClient(): Redis {
        return this.redisClient;
    }

    public async get(key: string): Promise<string> {
        return this.redisClient.get(key);
    }

    public async set(key: string, value: string): Promise<'OK'> {
        return this.redisClient.set(key, value);
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
}
