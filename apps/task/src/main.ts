import { NestFactory } from '@nestjs/core';
import { TaskModule } from './task.module';
import { Logger } from '@nestjs/common';
import { RpcExceptionFilter, useRabbitMQ } from '@app/common';

async function bootstrap(port: number) {
    const logger = new Logger('task');
    const app = await NestFactory.create(TaskModule);
    app.useGlobalFilters(new RpcExceptionFilter());
    useRabbitMQ(app, 'RABBITMQ_TASK_QUEUE');

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
