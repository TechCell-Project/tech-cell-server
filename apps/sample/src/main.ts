import { NestFactory } from '@nestjs/core';
import { SampleModule } from './sample.module';
import { useRabbitMQ } from '@app/common';
import { Logger } from '@nestjs/common';
import { RpcExceptionFilter } from '@app/common/filters/';

async function bootstrap() {
    const port = process.env.SERVICE_SAMPLE_PORT;
    const app = await NestFactory.create(SampleModule);
    app.useGlobalFilters(new RpcExceptionFilter());
    useRabbitMQ(app, 'RABBITMQ_SAMPLE_QUEUE');
    await app.startAllMicroservices();
    await app.listen(port);
    Logger.log(`⚡️ [Server] Listening on http://localhost:${port}`);
}
bootstrap();
