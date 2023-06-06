import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from '@app/common';
import { AppController } from './app.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env',
        }),
        RabbitMQModule.registerRmq('SAMPLE_SERVICE', process.env.RABBITMQ_SAMPLE_QUEUE),
    ],
    controllers: [AppController],
})
export class AppModule {}
