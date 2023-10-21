import { Module } from '@nestjs/common';
import { AppConfigModule } from '@app/common';
import { RabbitMQService } from '@app/common/RabbitMQ';
import { CloudinaryModule } from '@app/third-party/cloudinary.com';
import { UsersMntModule } from '~apps/managements/users-mnt';
import { ProductsMntModule } from '~apps/managements/products-mnt';
import { AttributesMntModule } from './attributes-mnt';
import { CategoriesMntModule } from './categories-mnt';
import { ImagesMntModule } from './images-mnt/images-mnt.module';
import { DiscountsMntModule } from './discounts-mnt';

@Module({
    imports: [
        AppConfigModule,
        CloudinaryModule,
        UsersMntModule,
        ProductsMntModule,
        AttributesMntModule,
        CategoriesMntModule,
        ImagesMntModule,
        DiscountsMntModule,
    ],
    providers: [RabbitMQService],
})
export class ManagementsModule {}
