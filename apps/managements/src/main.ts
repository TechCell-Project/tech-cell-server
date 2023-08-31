import { NestFactory } from '@nestjs/core';
import { ManagementsModule } from './managements.module';
import { RpcExceptionFilter, useRabbitMQ } from '@app/common';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('managements');
    const app = await NestFactory.create(ManagementsModule);
    app.useGlobalFilters(new RpcExceptionFilter());
    useRabbitMQ(app, 'RABBITMQ_MANAGEMENTS_QUEUE');
    await app.startAllMicroservices();
    logger.log(`⚡️ service is ready`);
}
bootstrap();
