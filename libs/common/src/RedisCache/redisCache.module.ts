import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { REDIS_CACHE } from '~/constants';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: REDIS_CACHE,
            useFactory: async (configService: ConfigService) =>
                await redisStore({
                    socket: {
                        host: configService.get('REDIS_HOST'),
                        port: +configService.get('REDIS_PORT'),
                    },
                    password: configService.get('REDIS_DEFAULT_PASSWORD'),
                    ttl: 5000,
                }),
            inject: [ConfigService],
        },
    ],
    exports: [REDIS_CACHE],
})
export class RedisCacheModule {}
