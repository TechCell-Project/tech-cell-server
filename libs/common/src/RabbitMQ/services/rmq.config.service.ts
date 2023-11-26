import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from './rmq.service';
import { RmqOptions } from '@nestjs/microservices';

const logger = new Logger('RabbitMQ');

/**
 * @param app ISNestApplication instance
 * @param queueNameEnv A environment variable which is defined in the .env file that is used to configure the RabbitMQ queue name
 * @returns A promise that resolves when the application is initialized
 */
export function useRabbitMQ(app: INestApplication, queueNameEnv: string, inheritAppConfig = false) {
    try {
        const configService = app.get(ConfigService);
        const rmqService = app.get<RabbitMQService>(RabbitMQService);

        const queue = configService.get<string>(queueNameEnv);
        if (!queue) {
            throw new Error(`Queue environment not set:: ${queueNameEnv}`);
        }

        app.connectMicroservice<RmqOptions>(rmqService.getRmqOptions(queue), {
            inheritAppConfig,
        });
        logger.log(`⚡️ Config microservice successfully, listen on: ${queue}`);
    } catch (error) {
        logger.error(`⚡️ Config failed: ${error});`);
    }
}
