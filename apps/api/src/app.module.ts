import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfigModule } from '@app/common';
import { RabbitMQModule } from '@app/common/RabbitMQ';
import { HealthModule } from '@app/common/HealthCheck';
import { ListControllers } from './controllers';
import {
    SEARCH_SERVICE,
    UTILITY_SERVICE,
    AUTH_SERVICE,
    MANAGEMENTS_SERVICE,
    ORDER_SERVICE,
    TASK_SERVICE,
} from '@app/common/constants';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { MorganMiddleware } from './middlewares';
import { GoogleStrategy, AccessTokenStrategy, FacebookStrategy } from '~apps/auth/strategies';
import { CloudinaryModule } from '@app/third-party/cloudinary.com';
import { MulterModule } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { UploadConstants } from '@app/common/constants/upload.constant';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ApiTaskService } from './api-task.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        AppConfigModule,
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
        MulterModule.registerAsync({
            useFactory: () => ({
                dest: UploadConstants.multerUploadTmpFolderDir,
                storage: diskStorage({
                    destination: (req, file, cb) => {
                        cb(null, UploadConstants.multerUploadTmpFolderDir);
                    },
                    filename: (req, file, cb) => {
                        cb(null, `${uuidv4()}-${Date.now()}-${file.originalname}`);
                    },
                }),
            }),
        }),
        ServeStaticModule.forRoot({
            rootPath: UploadConstants.multerUploadTmpFolderDir,
            serveRoot: '/public/',
            serveStaticOptions: {
                index: false,
            },
        }),
        ScheduleModule.forRoot(),
        RabbitMQModule.registerRmq(UTILITY_SERVICE, process.env.RABBITMQ_UTILITY_QUEUE),
        RabbitMQModule.registerRmq(SEARCH_SERVICE, process.env.RABBITMQ_SEARCH_QUEUE),
        RabbitMQModule.registerRmq(AUTH_SERVICE, process.env.RABBITMQ_AUTH_QUEUE),
        RabbitMQModule.registerRmq(MANAGEMENTS_SERVICE, process.env.RABBITMQ_MANAGEMENTS_QUEUE),
        RabbitMQModule.registerRmq(ORDER_SERVICE, process.env.RABBITMQ_ORDER_QUEUE),
        RabbitMQModule.registerRmq(TASK_SERVICE, process.env.RABBITMQ_TASK_QUEUE),
    ],
    controllers: ListControllers,
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        GoogleStrategy,
        AccessTokenStrategy,
        FacebookStrategy,
        ApiTaskService,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(MorganMiddleware).forRoutes('*');
    }
}
