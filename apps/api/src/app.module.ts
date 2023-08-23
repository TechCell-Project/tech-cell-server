import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule, HealthModule } from '@app/common';
import Controller from './controllers';
import {
    SEARCH_SERVICE,
    SAMPLE_SERVICE,
    AUTH_SERVICE,
    MANAGEMENTS_SERVICE,
    ORDER_SERVICE,
} from '~/constants';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { MorganMiddleware } from './middlewares';
import { GoogleStrategy, AccessTokenStrategy, FacebookStrategy } from '~/apps/auth/strategies';
import { CloudinaryModule } from '@app/common/Cloudinary';

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
                storage: new ThrottlerStorageRedisService({
                    host: config.get('REDIS_HOST'),
                    port: config.get('REDIS_PORT'),
                    password: config.get('REDIS_PASSWORD'),
                }),
            }),
        }),
        CloudinaryModule,
        HealthModule,
        RabbitMQModule.registerRmq(SAMPLE_SERVICE, process.env.RABBITMQ_SAMPLE_QUEUE),
        RabbitMQModule.registerRmq(SEARCH_SERVICE, process.env.RABBITMQ_SEARCH_QUEUE),
        RabbitMQModule.registerRmq(AUTH_SERVICE, process.env.RABBITMQ_AUTH_QUEUE),
        RabbitMQModule.registerRmq(MANAGEMENTS_SERVICE, process.env.RABBITMQ_MANAGEMENTS_QUEUE),
        RabbitMQModule.registerRmq(ORDER_SERVICE, process.env.RABBITMQ_ORDER_QUEUE),
    ],
    controllers: [...Controller],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        GoogleStrategy,
        AccessTokenStrategy,
        FacebookStrategy,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(MorganMiddleware).forRoutes('*');
    }
}
