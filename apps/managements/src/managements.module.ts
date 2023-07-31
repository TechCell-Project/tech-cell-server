import { Module } from '@nestjs/common';
import { UsersMntModule } from '~/apps/managements/users-mnt';
import { ProductsMntModule } from '~/apps/managements/products-mnt';
import { AttributesMntModule } from './attributes-mnt';
import { CategoriesMntModule } from './categories-mnt';

@Module({
    imports: [UsersMntModule, ProductsMntModule, AttributesMntModule, CategoriesMntModule],
})
export class ManagementsModule {}
