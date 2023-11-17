import { RedisCacheModule } from '~libs/common/RedisCache';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { CloudinaryService } from '@app/third-party/cloudinary.com';
import { ProductsModule } from '@app/resource/products';
import { Module } from '@nestjs/common';
import { ImageTaskService } from './image-task.service';
import { UsersModule } from '@app/resource';

@Module({
    imports: [RedisCacheModule, ProductsModule, UsersModule],
    providers: [RabbitMQService, CloudinaryService, ImageTaskService],
    exports: [ImageTaskService],
})
export class ImageTaskModule {}
