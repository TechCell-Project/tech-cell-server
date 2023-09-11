import { RedisCacheModule, RabbitMQService, CloudinaryService } from '@app/common';
import { ProductsModule } from '@app/resource/products';
import { Module } from '@nestjs/common';
import { ImageTaskService } from './image-task.service';

@Module({
    imports: [RedisCacheModule, ProductsModule],
    providers: [RabbitMQService, CloudinaryService, ImageTaskService],
    exports: [ImageTaskService],
})
export class ImageTaskModule {}
