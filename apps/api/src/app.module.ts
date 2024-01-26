import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfigModule, MongodbModule } from '~libs/common';
import { RabbitMQModule } from '~libs/common/RabbitMQ';
import { ListControllers } from './controllers';
import {
    SEARCH_SERVICE,
    UTILITY_SERVICE,
    AUTH_SERVICE,
    MANAGEMENTS_SERVICE,
    ORDER_SERVICE,
    TASK_SERVICE,
    COMMUNICATIONS_SERVICE,
} from '~libs/common/constants';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { MorganMiddleware } from './middlewares';
import { GoogleStrategy, AccessTokenStrategy } from '~apps/auth/strategies';
import { CloudinaryModule } from '~libs/third-party/cloudinary.com';
import { MulterModule } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { UploadConstants } from '~libs/common/constants/upload.constant';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ApiTaskService } from './services';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { I18nModule } from '~libs/common/i18n';

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
        HttpModule,
        MongodbModule,
        RabbitMQModule,
        TerminusModule.forRoot({
            errorLogStyle: 'json',
        }),
        CloudinaryModule,
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
        I18nModule,
        ScheduleModule.forRoot(),
        RabbitMQModule.registerRmq(UTILITY_SERVICE, process.env.RABBITMQ_UTILITY_QUEUE),
        RabbitMQModule.registerRmq(SEARCH_SERVICE, process.env.RABBITMQ_SEARCH_QUEUE),
        RabbitMQModule.registerRmq(AUTH_SERVICE, process.env.RABBITMQ_AUTH_QUEUE),
        RabbitMQModule.registerRmq(MANAGEMENTS_SERVICE, process.env.RABBITMQ_MANAGEMENTS_QUEUE),
        RabbitMQModule.registerRmq(ORDER_SERVICE, process.env.RABBITMQ_ORDER_QUEUE),
        RabbitMQModule.registerRmq(TASK_SERVICE, process.env.RABBITMQ_TASK_QUEUE),
        RabbitMQModule.registerRmq(
            COMMUNICATIONS_SERVICE,
            process.env.RABBITMQ_COMMUNICATIONS_QUEUE,
        ),
    ],
    controllers: ListControllers,
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        GoogleStrategy,
        AccessTokenStrategy,
        ApiTaskService,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(MorganMiddleware).forRoutes('*');
    }
}
