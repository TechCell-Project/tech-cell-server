import { NestFactory } from '@nestjs/core';
import { SearchModule } from './search.module';
import { useRabbitMQ } from '@app/common';
import { Logger } from '@nestjs/common';
import { RpcExceptionFilter } from '@app/common/filters/';

async function bootstrap() {
    const logger = new Logger('search');
    const app = await NestFactory.create(SearchModule);
    app.useGlobalFilters(new RpcExceptionFilter());
    useRabbitMQ(app, 'RABBITMQ_SEARCH_QUEUE');
    await app.startAllMicroservices();
    logger.log(`⚡️ service is ready`);
}
bootstrap();
