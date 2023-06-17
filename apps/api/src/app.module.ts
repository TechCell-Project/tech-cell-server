import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from '@app/common';
import Controller from './controllers';
import { PRODUCTS_SERVICE, SAMPLE_SERVICE, AUTH_SERVICE } from '~/constants';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env',
        }),
        ThrottlerModule.forRoot({
            // Global rate limit
            ttl: 60 * 5, // 5 minutes
            limit: 500, // request per ttl
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
