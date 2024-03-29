import { Module } from '@nestjs/common';
import { AppConfigModule } from '~libs/common';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { CloudinaryModule } from '~libs/third-party/cloudinary.com';
import { ImageTaskModule } from './image-task/image-task.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseTaskModule } from './database-task/database-task.module';
import { TaskHealthIndicator } from './task.health';
import { TaskController } from './task.controller';
import { I18nModule } from '~libs/common/i18n/i18n.module';

@Module({
    imports: [
        AppConfigModule,
        ScheduleModule.forRoot(),
        I18nModule,
        CloudinaryModule,
        ImageTaskModule,
        DatabaseTaskModule,
    ],
    controllers: [TaskController],
    providers: [RabbitMQService, TaskHealthIndicator],
})
export class TaskModule {}
