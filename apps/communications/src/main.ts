import { NestFactory } from '@nestjs/core';
import { CommunicationsModule } from './communications.module';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';
import { RedisIoAdapter } from '~libs/common/socket.io';

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

    app.startAllMicroservices().then(() => logger.log(`⚡️ microservices is ready`));
    app.listen(port).then(() =>
        logger.log(`⚡️ http is ready, listening on port ${port}, url: http://localhost:${port}`),
    );
}
bootstrap();
