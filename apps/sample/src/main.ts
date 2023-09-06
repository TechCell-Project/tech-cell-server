import { NestFactory } from '@nestjs/core';
import { SampleModule } from './sample.module';
import { useRabbitMQ } from '@app/common';
import { Logger } from '@nestjs/common';
import { RpcExceptionFilter } from '@app/common/filters/';
import * as net from 'net';

async function bootstrap() {
    const logger = new Logger('sample');
    const app = await NestFactory.create(SampleModule);
    app.useGlobalFilters(new RpcExceptionFilter());
    useRabbitMQ(app, 'RABBITMQ_SAMPLE_QUEUE');

    const port: string = process.env.SAMPLE_PORT || '3000';
    const server = net.createServer().listen(port);

    server.on('listening', () => {
        server.close();
        app.startAllMicroservices().then(() => logger.log(`⚡️ service is ready`));
        app.listen(port, () => logger.log(`⚡️ server is listening on port ${port}`));
    });

    server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
            logger.error(`Port ${port} is already in use. Trying another port...`);
            server.close();
            const newPort = parseInt(port, 10) + 1;
            app.startAllMicroservices().then(() => logger.log(`⚡️ service is ready`));
            app.listen(newPort, () => logger.log(`⚡️ server is listening on port ${newPort}`));
        } else {
            logger.error(err);
        }
    });
}

bootstrap();
