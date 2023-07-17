import { NestFactory } from '@nestjs/core';
import { SearchModule } from './search.module';
import { useRabbitMQ } from '@app/common';
import { Logger } from '@nestjs/common';
import { RpcExceptionFilter } from '@app/common/filters/';

async function bootstrap() {
    const port = process.env.SERVICE_SEARCH_PORT;
    const logger = new Logger('search');
    const app = await NestFactory.create(SearchModule);
    app.useGlobalFilters(new RpcExceptionFilter());
    useRabbitMQ(app, 'RABBITMQ_SEARCH_QUEUE');
    await app.startAllMicroservices();
    await app.listen(port);
    logger.log(`⚡️ ready on port: ${port}, url: http://localhost:${port}`);
}
bootstrap();
