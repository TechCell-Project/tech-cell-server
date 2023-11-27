import { NestFactory } from '@nestjs/core';
import { TaskModule } from './task.module';
import { Logger } from '@nestjs/common';
import { RabbitMQService } from '~libs/common/RabbitMQ';

async function bootstrap(port: number) {
    const logger = new Logger('task');
    const app = await NestFactory.create(TaskModule);
    RabbitMQService.connectRabbitMQ({
        app,
        queueNameEnv: 'RABBITMQ_TASK_QUEUE',
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
bootstrap(parseInt(process.env.TASK_PORT || '0', 10));
