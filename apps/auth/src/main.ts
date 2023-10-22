import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { useRabbitMQ } from '@app/common/RabbitMQ';
import { Logger } from '@nestjs/common';
import { RpcExceptionFilter } from '@app/common/filters/';

async function bootstrap() {
    const logger = new Logger('auth');
    const app = await NestFactory.create(AuthModule);
    app.useGlobalFilters(new RpcExceptionFilter());
    useRabbitMQ(app, 'RABBITMQ_AUTH_QUEUE');
    await app.startAllMicroservices();
    logger.log(`⚡️ service is ready`);
}
bootstrap();
