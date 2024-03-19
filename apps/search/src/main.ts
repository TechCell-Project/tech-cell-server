import { NestFactory } from '@nestjs/core';
import { SearchModule } from './search.module';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { Logger } from '@nestjs/common';
import { HttpToRpcExceptionFilter } from '~libs/common/filters';

async function bootstrap() {
    const logger = new Logger('search');
    const app = await NestFactory.create(SearchModule);

    app.useGlobalFilters(new HttpToRpcExceptionFilter());

    RabbitMQService.connectRabbitMQ({
        app,
        queueNameEnv: 'RABBITMQ_SEARCH_QUEUE',
        inheritAppConfig: true,
        logger,
    });

    app.startAllMicroservices().then(() => logger.log(`⚡️ service is ready`));
}
bootstrap();
