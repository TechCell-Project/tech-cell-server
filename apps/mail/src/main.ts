import { NestFactory } from '@nestjs/core';
import { MailModule } from './mail.module';
import { useRabbitMQ } from '@app/common/RabbitMQ';
import { Logger } from '@nestjs/common';
import { RpcExceptionFilter } from '@app/common/filters/';

async function bootstrap() {
    const logger = new Logger('mail');
    const app = await NestFactory.create(MailModule);
    app.useGlobalFilters(new RpcExceptionFilter());
    useRabbitMQ(app, 'RABBITMQ_MAIL_QUEUE');
    await app.startAllMicroservices();
    logger.log(`⚡️ service is ready`);
}
bootstrap();
