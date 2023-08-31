import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from '@app/common';
import { RmqOptions } from '@nestjs/microservices';

const logger = new Logger('RabbitMQ');

/**
 * @param app ISNestApplication instance
 * @param queueNameEnv A environment variable which is defined in the .env file that is used to configure the RabbitMQ queue name
 * @returns A promise that resolves when the application is initialized
 */
export function useRabbitMQ(app: INestApplication, queueNameEnv: string) {
    try {
        const configService = app.get(ConfigService);
        const rmqService = app.get<RabbitMQService>(RabbitMQService);

        const queue = configService.get(queueNameEnv);
        if (!queue) {
            throw new Error(`Queue environment not set:: ${queueNameEnv}`);
        }

        app.connectMicroservice<RmqOptions>(rmqService.getRmqOptions(queue));
        logger.log(`⚡️ Config successfully, listen on: ${queue}`);
    } catch (error) {
        logger.error(`⚡️ Config failed: ${error});`);
    }
}
