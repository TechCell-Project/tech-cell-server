import { Module } from '@nestjs/common';
import { ProductsModule } from '~libs/resource/products';
import { ProductsMntController } from './products-mnt.controller';
import { ProductsMntService } from './products-mnt.service';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { CloudinaryService } from '~libs/third-party/cloudinary.com';
import { AttributesModule, CategoriesModule } from '~libs/resource';
import { RedisModule } from '~libs/common/Redis';

@Module({
    imports: [RedisModule, ProductsModule, CategoriesModule, AttributesModule],
    controllers: [ProductsMntController],
    providers: [RabbitMQService, ProductsMntService, CloudinaryService],
})
export class ProductsMntModule {}
