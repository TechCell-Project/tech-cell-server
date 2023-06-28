import { Module } from '@nestjs/common';
import { ManagamentsController } from './managaments.controller';
import { ManagamentsService } from './managaments.service';
import { RabbitMQModule, RabbitMQService } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '@app/resource/users';

@Module({
    imports: [
        RabbitMQModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env',
        }),
        UsersModule,
    ],
    controllers: [ManagamentsController],
    providers: [ManagamentsService, RabbitMQService],
})
export class ManagamentsModule {}
