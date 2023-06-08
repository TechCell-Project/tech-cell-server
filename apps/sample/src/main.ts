import { NestFactory } from '@nestjs/core';
import { SampleModule } from './sample.module';
import { configRmqService } from '@app/common';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const port = process.env.SERVICE_SAMPLE_PORT;
    const app = await NestFactory.create(SampleModule);
    configRmqService(app, 'RABBITMQ_SAMPLE_QUEUE');
    await app.listen(port);
    Logger.log(`⚡️ [sample] Sample service listening on http://localhost:${port}`);
}
bootstrap();
