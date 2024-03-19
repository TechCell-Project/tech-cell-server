import { NestFactory } from '@nestjs/core';
import { UtilityModule } from './utility.module';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { Logger } from '@nestjs/common';
import { HttpToRpcExceptionFilter } from '~libs/common/filters';

async function bootstrap(port: number) {
    const logger = new Logger('utility');
    const app = await NestFactory.create(UtilityModule);

    app.useGlobalFilters(new HttpToRpcExceptionFilter());

    RabbitMQService.connectRabbitMQ({
        app,
        queueNameEnv: 'RABBITMQ_UTILITY_QUEUE',
        inheritAppConfig: true,
        logger,
    });

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
