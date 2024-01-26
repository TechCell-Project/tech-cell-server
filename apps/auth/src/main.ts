import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('auth');
    const app = await NestFactory.create(AuthModule);
    RabbitMQService.connectRabbitMQ({
        app,
        queueNameEnv: 'RABBITMQ_AUTH_QUEUE',
        inheritAppConfig: true,
        logger,
    });

    app.startAllMicroservices().then(() => logger.log(`⚡️ service is ready`));
}
bootstrap();
