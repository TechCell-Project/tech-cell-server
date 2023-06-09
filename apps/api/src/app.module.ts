import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from '@app/common';
import Controller from './controllers';
import { PRODUCTS_SERVICE, SAMPLE_SERVICE } from '../../constants';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env',
        }),
        RabbitMQModule.registerRmq(SAMPLE_SERVICE, process.env.RABBITMQ_SAMPLE_QUEUE),
        RabbitMQModule.registerRmq(PRODUCTS_SERVICE, process.env.RABBITMQ_PRODUCTS_QUEUE),
    ],
    controllers: [...Controller],
})
export class AppModule {}
