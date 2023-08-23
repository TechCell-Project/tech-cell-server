import { Module } from '@nestjs/common';
import { UsersMntModule } from '~/apps/managements/users-mnt';
import { ProductsMntModule } from '~/apps/managements/products-mnt';
import { AttributesMntModule } from './attributes-mnt';
import { CategoriesMntModule } from './categories-mnt';
import { AppConfigModule, RabbitMQService } from '@app/common';
import { CloudinaryModule } from '@app/common/Cloudinary';

@Module({
    imports: [
        AppConfigModule,
        CloudinaryModule,
        UsersMntModule,
        ProductsMntModule,
        AttributesMntModule,
        CategoriesMntModule,
    ],
    providers: [RabbitMQService],
})
export class ManagementsModule {}
