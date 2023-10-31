import { Module } from '@nestjs/common';
import { AppConfigModule } from '@app/common';
import { RabbitMQService } from '@app/common/RabbitMQ';
import { CloudinaryModule } from '@app/third-party/cloudinary.com';
import { ImageTaskModule } from './image-task/image-task.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseTaskModule } from './database-task/database-task.module';
import { TaskHealthIndicator } from './task.health';
import { TaskController } from './task.controller';

@Module({
    imports: [
        AppConfigModule,
        ScheduleModule.forRoot(),
        CloudinaryModule,
        ImageTaskModule,
        DatabaseTaskModule,
    ],
    controllers: [TaskController],
    providers: [RabbitMQService, TaskHealthIndicator],
})
export class TaskModule {}
