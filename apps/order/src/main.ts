import { NestFactory } from '@nestjs/core';
import { OrderModule } from './order.module';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { Logger } from '@nestjs/common';
import { HttpToRpcExceptionFilter } from '~libs/common/filters/http-to-rpc-exception.filter';

async function bootstrap() {
    const logger = new Logger('order');
    const app = await NestFactory.create(OrderModule);

    app.useGlobalFilters(new HttpToRpcExceptionFilter());

    RabbitMQService.connectRabbitMQ({
        app,
        queueNameEnv: 'RABBITMQ_ORDER_QUEUE',
        inheritAppConfig: true,
        logger,
    });

    app.startAllMicroservices().then(() => logger.log(`⚡️ service is ready`));
    app.listen(0).then(() => logger.log(`⚡️ http is ready, listening on port`));
}
bootstrap();
