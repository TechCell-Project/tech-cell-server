import { NestFactory } from '@nestjs/core';
import { SampleModule } from './sample.module';
import { configRmqService } from '@app/common';

async function bootstrap() {
    const app = await NestFactory.create(SampleModule);
    // const configService = app.get(ConfigService);
    // const rmqService = app.get(RabbitMQService);

    // const queue = configService.get('RABBITMQ_SAMPLE_QUEUE');

    // app.connectMicroservice(rmqService.getRmqOptions(queue));
    // app.startAllMicroservices();
    configRmqService(app, 'RABBITMQ_SAMPLE_QUEUE');
}
bootstrap();
