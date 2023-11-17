import { Module } from '@nestjs/common';
import { AppConfigModule } from '~libs/common';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { CloudinaryModule } from '@app/third-party/cloudinary.com';
import { UsersMntModule } from '~apps/managements/users-mnt';
import { ProductsMntModule } from '~apps/managements/products-mnt';
import { AttributesMntModule } from './attributes-mnt';
import { CategoriesMntModule } from './categories-mnt';
import { ImagesMntModule } from './images-mnt/images-mnt.module';
import { DiscountsMntModule } from './discounts-mnt';
import { ManagementsHealthIndicator } from './managements.health';
import { ManagementsController } from './managements.controller';
import { OrdersMntModule } from './orders-mnt';

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
        OrdersMntModule,
    ],
    controllers: [ManagementsController],
    providers: [RabbitMQService, ManagementsHealthIndicator],
})
export class ManagementsModule {}
