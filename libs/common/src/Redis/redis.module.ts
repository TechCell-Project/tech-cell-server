import { DynamicModule, Logger, Module } from '@nestjs/common';
import { Redis, RedisOptions } from 'ioredis';
import { REDIS_CLIENT, REDIS_STORE } from '../constants/provider.constant';
import { RedlockService } from './services/redlock.service';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './services/redis.service';
import { redisStore } from 'cache-manager-ioredis-yet';
import { RedisStateService } from './services';

@Module({
    providers: [
        {
            provide: REDIS_CLIENT,
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return new Redis({
                    host: config.get<string>('REDIS_HOST'),
                    port: config.get<number>('REDIS_PORT'),
                    password: config.get<string>('REDIS_PASSWORD'),
                    reconnectOnError: (err) => {
                        Logger.error(err);
                        return true;
                    },
                } as RedisOptions);
            },
        },
        {
            provide: REDIS_STORE,
            useFactory: async () =>
                await redisStore({
                    host: process.env.REDIS_HOST,
                    port: +process.env.REDIS_PORT, // '+' means convert string to number
                    password: process.env.REDIS_PASSWORD,
                    ttl: 5000, // 5 secs
                    reconnectOnError: (err) => {
                        Logger.error(err);
                        return true;
                    },
                }),
        },
        RedisService,
        RedlockService,
        RedisStateService,
    ],
    exports: [REDIS_CLIENT, REDIS_STORE, RedisService, RedlockService, RedisStateService],
})
export class RedisModule {
    static register(options: RedisOptions): DynamicModule {
        return {
            module: RedisModule,
            providers: [
                {
                    provide: REDIS_CLIENT,
                    useFactory: () => {
                        return new Redis(options);
                    },
                },
                RedisService,
                RedlockService,
            ],
            exports: [REDIS_CLIENT, RedisService, RedlockService],
        };
    }
}
