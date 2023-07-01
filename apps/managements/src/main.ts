import { NestFactory } from '@nestjs/core';
import { ManagementsModule } from './managements.module';
import { RpcExceptionFilter, useRabbitMQ } from '@app/common';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const port = process.env.SERVICE_MANAGEMENTS_PORT;
    const app = await NestFactory.create(ManagementsModule);
    app.useGlobalFilters(new RpcExceptionFilter());
    useRabbitMQ(app, 'RABBITMQ_MANAGEMENTS_QUEUE');
    await app.startAllMicroservices();
    await app.listen(port);
    Logger.log(`⚡️ [Managements] Listening on http://localhost:${port}`);
}
bootstrap();
