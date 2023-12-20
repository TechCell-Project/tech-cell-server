import { NestFactory } from '@nestjs/core';
import { ManagementsModule } from './managements.module';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { Logger } from '@nestjs/common';
import { HttpToRpcExceptionFilter } from '~libs/common/filters/http-to-rpc-exception.filter';

async function bootstrap() {
    const logger = new Logger('managements');
    const app = await NestFactory.create(ManagementsModule);

    app.useGlobalFilters(new HttpToRpcExceptionFilter());

    RabbitMQService.connectRabbitMQ({
        app,
        queueNameEnv: 'RABBITMQ_MANAGEMENTS_QUEUE',
        inheritAppConfig: true,
        logger,
    });

    app.startAllMicroservices().then(() => logger.log(`⚡️ service is ready`));
}
bootstrap();
