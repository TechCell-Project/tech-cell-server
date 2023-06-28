import { NestFactory } from '@nestjs/core';
import { ManagamentsModule } from './managaments.module';
import { RpcExceptionFilter, useRabbitMQ } from '@app/common';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const port = process.env.SERVICE_MANAGAMENTS_PORT;
    const app = await NestFactory.create(ManagamentsModule);
    app.useGlobalFilters(new RpcExceptionFilter());
    useRabbitMQ(app, 'RABBITMQ_MANAGAMENTS_QUEUE');
    await app.startAllMicroservices();
    await app.listen(port);
    Logger.log(`⚡️ [Managaments] Listening on http://localhost:${port}`);
}
bootstrap();
