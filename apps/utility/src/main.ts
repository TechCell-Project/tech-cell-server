import { NestFactory } from '@nestjs/core';
import { UtilityModule } from './utility.module';
import { useRabbitMQ } from '~libs/common/RabbitMQ';
import { Logger } from '@nestjs/common';
import { RpcExceptionFilter } from '~libs/common/filters/';

async function bootstrap(port: number) {
    const logger = new Logger('utility');
    const app = await NestFactory.create(UtilityModule);
    app.useGlobalFilters(new RpcExceptionFilter());
    useRabbitMQ(app, 'RABBITMQ_UTILITY_QUEUE');

    app.listen(port)
        .then(async () => {
            const assignedPort = app.getHttpServer().address().port;
            logger.log(`⚡️ server is listening on port ${assignedPort}`);
            await app.startAllMicroservices().then(() => logger.log(`⚡️ service is ready`));
        })
        .catch(async () => {
            logger.warn(` port ${port} is already in use, trying ${port + 1}`);
            await app.close();
            bootstrap(++port);
        });
}

bootstrap(parseInt(process.env.UTILITY_PORT || '0', 10));
