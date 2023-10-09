import { Module } from '@nestjs/common';
import { AppConfigModule, RabbitMQService } from '@app/common';
import { CloudinaryModule } from '@app/third-party/cloudinary.com';
import { ImageTaskModule } from './image-task/image-task.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [AppConfigModule, ScheduleModule.forRoot(), CloudinaryModule, ImageTaskModule],
    providers: [RabbitMQService],
})
export class TaskModule {}
