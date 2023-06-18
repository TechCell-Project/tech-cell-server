import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@app/common';
import Controller from './controllers';
import { PRODUCTS_SERVICE, SAMPLE_SERVICE, AUTH_SERVICE } from '~/constants';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env',
        }),
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                ttl: config.get('THROTTLE_GLOBAL_TTL'),
                limit: config.get('THROTTLE_GLOBAL_LIMIT'),
                storage: new ThrottlerStorageRedisService(config.get('REDIS_URI')),
            }),
        }),
        RabbitMQModule.registerRmq(SAMPLE_SERVICE, process.env.RABBITMQ_SAMPLE_QUEUE),
        RabbitMQModule.registerRmq(PRODUCTS_SERVICE, process.env.RABBITMQ_PRODUCTS_QUEUE),
        RabbitMQModule.registerRmq(AUTH_SERVICE, process.env.RABBITMQ_AUTH_QUEUE),
    ],
    controllers: [...Controller],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
