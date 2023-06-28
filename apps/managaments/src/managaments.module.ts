import { Module } from '@nestjs/common';
import { UsersMntModule } from '~/apps/managaments/users-mnt';

@Module({
    imports: [UsersMntModule],
})
export class ManagamentsModule {}
