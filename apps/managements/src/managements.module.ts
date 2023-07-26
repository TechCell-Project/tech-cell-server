import { Module } from '@nestjs/common';
import { UsersMntModule } from '~/apps/managements/users-mnt';
import { ProductsMntModule } from '~/apps/managements/products-mnt';
import { AttributesMntModule } from './attributes-mnt';

@Module({
    imports: [UsersMntModule, ProductsMntModule, AttributesMntModule],
})
export class ManagementsModule {}
