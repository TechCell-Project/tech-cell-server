import { Module } from '@nestjs/common';
import { UsersMntModule } from '~/apps/managements/users-mnt';
import { ProductsMntModule } from '~/apps/managements/products-mnt';

@Module({
    imports: [UsersMntModule, ProductsMntModule],
})
export class ManagementsModule {}
