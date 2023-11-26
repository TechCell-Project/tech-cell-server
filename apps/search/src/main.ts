import { NestFactory } from '@nestjs/core';
import { SearchModule } from './search.module';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('search');
    const app = await NestFactory.create(SearchModule);
    RabbitMQService.connectRabbitMQ(app, 'RABBITMQ_SEARCH_QUEUE', true);
    await app.startAllMicroservices();
    logger.log(`⚡️ service is ready`);
}
bootstrap();
