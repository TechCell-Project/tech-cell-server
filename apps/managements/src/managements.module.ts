import { Module } from '@nestjs/common';
import { AppConfigModule, RabbitMQService } from '@app/common';
import { CloudinaryModule } from '@app/common/Cloudinary';
import { UsersMntModule } from '~/apps/managements/users-mnt';
import { ProductsMntModule } from '~/apps/managements/products-mnt';
import { AttributesMntModule } from './attributes-mnt';
import { CategoriesMntModule } from './categories-mnt';
import { CartsMntModule } from './carts-mnt';

@Module({
    imports: [
        AppConfigModule,
        CloudinaryModule,
        UsersMntModule,
        ProductsMntModule,
        AttributesMntModule,
        CategoriesMntModule,
        CartsMntModule,
    ],
    providers: [RabbitMQService],
})
export class ManagementsModule {}
