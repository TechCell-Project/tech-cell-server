import { RabbitMQService } from '~libs/common/RabbitMQ';
import { CloudinaryService } from '~libs/third-party/cloudinary.com';
import { ProductsModule } from '~libs/resource/products';
import { Module } from '@nestjs/common';
import { ImageTaskService } from './image-task.service';
import { UsersModule } from '~libs/resource';
import { RedisModule } from '~libs/common/Redis/redis.module';

@Module({
    imports: [RedisModule, ProductsModule, UsersModule],
    providers: [RabbitMQService, CloudinaryService, ImageTaskService],
    exports: [ImageTaskService],
})
export class ImageTaskModule {}
