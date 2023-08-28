import { Module } from '@nestjs/common';
import { ProductsModule } from '@app/resource/products';
import { ProductsMntController } from './products-mnt.controller';
import { ProductsMntService } from './products-mnt.service';
import { RabbitMQService, RedisCacheModule } from '@app/common';
import { CloudinaryService } from '@app/common/Cloudinary';
import { AttributesModule, CategoriesModule } from '@app/resource';

@Module({
    imports: [RedisCacheModule, ProductsModule, CategoriesModule, AttributesModule],
    controllers: [ProductsMntController],
    providers: [RabbitMQService, ProductsMntService, CloudinaryService],
})
export class ProductsMntModule {}
