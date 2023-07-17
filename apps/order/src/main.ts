import { NestFactory } from '@nestjs/core';
import { OrderModule } from './order.module';
import { useRabbitMQ } from '@app/common';
import { Logger } from '@nestjs/common';
import { RpcExceptionFilter } from '@app/common/filters/';

async function bootstrap() {
    const port = process.env.SERVICE_ORDER_PORT;
    const logger = new Logger('order');
    const app = await NestFactory.create(OrderModule);
    app.useGlobalFilters(new RpcExceptionFilter());
    useRabbitMQ(app, 'RABBITMQ_ORDER_QUEUE');
    await app.startAllMicroservices();
    await app.listen(port);
    logger.log(`⚡️ ready on port: ${port}, url: http://localhost:${port}`);
}
bootstrap();
