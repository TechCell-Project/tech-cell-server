import { NestFactory } from '@nestjs/core';
import { SampleModule } from './sample.module';
import { useRabbitMQ } from '@app/common';
import { Logger } from '@nestjs/common';
import { RpcExceptionFilter } from '@app/common/filters/';

async function bootstrap(port: number) {
    const logger = new Logger('sample');
    const app = await NestFactory.create(SampleModule);
    app.useGlobalFilters(new RpcExceptionFilter());
    useRabbitMQ(app, 'RABBITMQ_SAMPLE_QUEUE');

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

bootstrap(parseInt(process.env.SAMPLE_PORT || '0', 10));
