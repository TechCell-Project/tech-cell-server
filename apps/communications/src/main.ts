import { NestFactory } from '@nestjs/core';
import { CommunicationsModule } from './communications.module';
import { useRabbitMQ } from '@app/common/RabbitMQ';
import { Logger } from '@nestjs/common';
import { RpcExceptionFilter } from '@app/common/filters/';

async function bootstrap() {
    const logger = new Logger('mail');
    const app = await NestFactory.create(CommunicationsModule);
    app.useGlobalFilters(new RpcExceptionFilter());
    useRabbitMQ(app, 'RABBITMQ_COMMUNICATIONS_QUEUE');
    await app.startAllMicroservices();
    logger.log(`⚡️ service is ready`);
    await app.listen(3000);
}
bootstrap();
