import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from '@app/common';
import { RmqOptions } from '@nestjs/microservices';

/**
 * @param app ISNestApplication instance
 * @param queueNameEnv A environment variable which is defined in the .env file that is used to configure the RabbitMQ queue name
 * @returns A promise that resolves when the application is initialized
 */
export async function useRabbitMQ(app: INestApplication, queueNameEnv: string) {
    const configService = app.get(ConfigService);
    const rmqService = app.get<RabbitMQService>(RabbitMQService);

    const queue = configService.get(queueNameEnv);

    app.connectMicroservice<RmqOptions>(rmqService.getRmqOptions(queue));
    await app.startAllMicroservices();
    Logger.log(`⚡️ [${queue}] Started listening on queue: ${queue}`);
}
