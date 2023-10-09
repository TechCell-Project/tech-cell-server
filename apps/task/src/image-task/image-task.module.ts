import { RedisCacheModule, RabbitMQService } from '@app/common';
import { CloudinaryService } from '@app/third-party/cloudinary.com';
import { ProductsModule } from '@app/resource/products';
import { Module } from '@nestjs/common';
import { ImageTaskService } from './image-task.service';

@Module({
    imports: [RedisCacheModule, ProductsModule],
    providers: [RabbitMQService, CloudinaryService, ImageTaskService],
    exports: [ImageTaskService],
})
export class ImageTaskModule {}
