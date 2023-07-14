import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { useRabbitMQ } from '@app/common';
import { Logger } from '@nestjs/common';
import { RpcExceptionFilter } from '@app/common/filters/';

async function bootstrap() {
    const port = process.env.SERVICE_AUTH_PORT;
    const logger = new Logger('auth');
    const app = await NestFactory.create(AuthModule);
    app.useGlobalFilters(new RpcExceptionFilter());
    useRabbitMQ(app, 'RABBITMQ_AUTH_QUEUE');
    await app.startAllMicroservices();
    await app.listen(port);
    logger.log(`⚡️ ready on port: ${port}, url: http://localhost:${port}`);
}
bootstrap();
