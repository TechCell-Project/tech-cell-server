import { Module } from '@nestjs/common';
import { AppConfigModule, RabbitMQService } from '@app/common';
import { CloudinaryModule } from '@app/third-party/cloudinary.com';
import { ImageTaskModule } from './image-task/image-task.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseTaskModule } from './database-task/database-task.module';

@Module({
    imports: [
        AppConfigModule,
        ScheduleModule.forRoot(),
        CloudinaryModule,
        ImageTaskModule,
        DatabaseTaskModule,
    ],
    providers: [RabbitMQService],
})
export class TaskModule {}
