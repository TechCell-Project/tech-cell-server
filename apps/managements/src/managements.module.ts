import { Module } from '@nestjs/common';
import { UsersMntModule } from '~/apps/managements/users-mnt';

@Module({
    imports: [UsersMntModule],
})
export class ManagementsModule {}
