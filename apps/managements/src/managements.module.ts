import { Module } from '@nestjs/common';
import { AppConfigModule, RabbitMQService } from '@app/common';
import { CloudinaryModule } from '@app/third-party/cloudinary.com';
import { UsersMntModule } from '~/apps/managements/users-mnt';
import { ProductsMntModule } from '~/apps/managements/products-mnt';
import { AttributesMntModule } from './attributes-mnt';
import { CategoriesMntModule } from './categories-mnt';
import { ImagesMntModule } from './images-mnt/images-mnt.module';

@Module({
    imports: [
        AppConfigModule,
        CloudinaryModule,
        UsersMntModule,
        ProductsMntModule,
        AttributesMntModule,
        CategoriesMntModule,
        ImagesMntModule,
    ],
    providers: [RabbitMQService],
})
export class ManagementsModule {}
