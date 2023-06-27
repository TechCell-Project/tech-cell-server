import { Module } from '@nestjs/common';
import { ManagamentsController } from './managaments.controller';
import { ManagamentsService } from './managaments.service';
import { RabbitMQModule, RabbitMQService } from '@app/common';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        RabbitMQModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env',
        }),
    ],
    controllers: [ManagamentsController],
    providers: [ManagamentsService, RabbitMQService],
})
export class ManagamentsModule {}
