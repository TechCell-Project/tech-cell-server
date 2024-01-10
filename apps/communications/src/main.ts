import { NestFactory } from '@nestjs/core';
import { CommunicationsModule } from './communications.module';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';
import { RedisIoAdapter } from '~libs/common/socket.io';
import { AsyncApiDocumentBuilder, AsyncApiModule } from 'nestjs-asyncapi';

async function bootstrap() {
    const port = process.env.COMMUNICATIONS_PORT || 8001;
    const logger = new Logger('communications');
    const app = await NestFactory.create(CommunicationsModule);
    app.use(helmet());

    RabbitMQService.connectRabbitMQ({
        app,
        queueNameEnv: 'RABBITMQ_COMMUNICATIONS_QUEUE',
        inheritAppConfig: true,
        logger,
    });

    const redisIoAdapter = new RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);

    const asyncApiOptions = new AsyncApiDocumentBuilder()
        .setTitle('Techcell Socket Documentation')
        .setDescription('Techcell Socket Documentation')
        .setVersion('0.0.1')
        .setDefaultContentType('application/json')
        .addServer('local-ws', {
            url: `ws://localhost:${port}`,
            protocol: 'socket.io',
        })
        .addServer('deploy-ws', {
            url: `wss://socket.techcell.cloud`,
            protocol: 'socket.io',
        })
        .build();

    const asyncapiDocument = AsyncApiModule.createDocument(app, asyncApiOptions);
    await AsyncApiModule.setup('/', app, asyncapiDocument);

    app.startAllMicroservices().then(() => logger.log(`⚡️ microservices is ready`));
    app.listen(port).then(() =>
        logger.log(`⚡️ http is ready, listening on port ${port}, url: http://localhost:${port}`),
    );
}
bootstrap();
