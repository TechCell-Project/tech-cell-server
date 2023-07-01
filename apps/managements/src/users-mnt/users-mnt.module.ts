import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '@app/resource/users';
import { UsersMntController } from './users-mnt.controller';
import { UsersMntService } from './users-mnt.service';
import { RabbitMQModule, RabbitMQService } from '@app/common';

@Module({
    imports: [
        RabbitMQModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env',
        }),
        UsersModule,
    ],
    controllers: [UsersMntController],
    providers: [RabbitMQService, UsersMntService],
})
export class UsersMntModule {}
