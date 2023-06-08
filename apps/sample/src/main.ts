import { NestFactory } from '@nestjs/core';
import { SampleModule } from './sample.module';
import { configRmqService } from '@app/common';

async function bootstrap() {
    const app = await NestFactory.create(SampleModule);
    configRmqService(app, 'RABBITMQ_SAMPLE_QUEUE');
    app.listen(1001);
}
bootstrap();
