/*
https://docs.nestjs.com/modules
*/

import { DynamicModule, Module } from '@nestjs/common';
import { Redis, RedisOptions } from 'ioredis';
import { REDIS_CLIENT } from '../constants/provider.constant';
import { RedlockService } from './services/redlock.service';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './services/redis.service';

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
                } as RedisOptions);
            },
        },
        RedisService,
        RedlockService,
    ],
    exports: [REDIS_CLIENT, RedisService, RedlockService],
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
