import { NestFactory } from '@nestjs/core';
import { OrderModule } from './order.module';
import { useRabbitMQ } from '~libs/common/RabbitMQ';
import { Logger } from '@nestjs/common';
import { RpcExceptionFilter } from '~libs/common/filters/';

async function bootstrap() {
    const logger = new Logger('order');
    const app = await NestFactory.create(OrderModule);
    app.useGlobalFilters(new RpcExceptionFilter());
    useRabbitMQ(app, 'RABBITMQ_ORDER_QUEUE');
    app.startAllMicroservices().then(() => logger.log(`⚡️ service is ready`));
    app.listen(0).then(() => logger.log(`⚡️ http is ready, listening on port`));
}
bootstrap();
