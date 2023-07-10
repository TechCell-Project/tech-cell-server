import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CACHE } from '~/constants';
import { Store } from 'cache-manager';

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
}
