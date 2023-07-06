import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { REDIS_CACHE } from '~/constants';

@Injectable()
export class CacheManager {
    constructor(@Inject(REDIS_CACHE) protected cacheManager: Cache) {}

    async get(key: string) {
        return await this.cacheManager.get(key);
    }

    async set(key: string, value: any, ttl: number) {
        return await this.cacheManager.set(key, value, ttl);
    }

    async del(key: string) {
        return await this.cacheManager.del(key);
    }

    async delStartWith(prefix: string) {
        const keys = await this.cacheManager.store.keys();
        const keysToDelete = keys.filter((key) => key.startsWith(prefix));

        await Promise.all(keysToDelete.map((key) => this.cacheManager.del(key)));

        return keysToDelete;
    }

    async reset() {
        return await this.cacheManager.reset();
    }

    async wrap<T>(key: string, fn: () => Promise<T>, ttl: number) {
        const value = await this.cacheManager.get<T>(key);
        if (value) {
            return value;
        }

        const result = await fn();
        await this.cacheManager.set(key, result, ttl);
        return result;
    }

    async store() {
        return await this.cacheManager.store;
    }
}
