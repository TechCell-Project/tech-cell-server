import { Module } from '@nestjs/common';
import { ProductsModule } from '@app/resource/products';
import { ProductsMntController } from './products-mnt.controller';
import { ProductsMntService } from './products-mnt.service';
import { RedisCacheModule } from '@app/common/RedisCache';
import { RabbitMQService } from '@app/common/RabbitMQ';
import { CloudinaryService } from '@app/third-party/cloudinary.com';
import { AttributesModule, CategoriesModule } from '@app/resource';

@Module({
    imports: [RedisCacheModule, ProductsModule, CategoriesModule, AttributesModule],
    controllers: [ProductsMntController],
    providers: [RabbitMQService, ProductsMntService, CloudinaryService],
})
export class ProductsMntModule {}
