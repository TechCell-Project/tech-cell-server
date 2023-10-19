import { Module } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-yet';
import { REDIS_CACHE } from '@app/common/constants';

@Module({
    providers: [
        {
            provide: REDIS_CACHE,
            useFactory: async () =>
                await redisStore({
                    socket: {
                        host: process.env.REDIS_HOST,
                        port: +process.env.REDIS_PORT, // '+' means convert string to number
                    },
                    password: process.env.REDIS_PASSWORD,
                    ttl: 5000, // 5 secs
                }),
        },
    ],
    exports: [REDIS_CACHE],
})
export class RedisCacheModule {}
