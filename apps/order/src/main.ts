import { NestFactory } from '@nestjs/core';
import { OrderModule } from './order.module';
import { useRabbitMQ } from '@app/common';
import { Logger } from '@nestjs/common';
import { RpcExceptionFilter } from '@app/common/filters/';

async function bootstrap() {
    const logger = new Logger('order');
    const app = await NestFactory.create(OrderModule);
    app.useGlobalFilters(new RpcExceptionFilter());
    useRabbitMQ(app, 'RABBITMQ_ORDER_QUEUE');
    await app.startAllMicroservices();
    logger.log(`⚡️ service is ready`);
    app.listen(3000);
}
bootstrap();
