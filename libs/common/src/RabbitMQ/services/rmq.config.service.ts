import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from '@app/common';

/**
 * @param app ISNestApplication instance
 * @param queueNameEnv A environment variable which will be used to configure the RabbitMQ service queue
 * @returns A promise that resolves when the application is initialized
 */
export async function configRmqService(app: INestApplication, queueNameEnv: string) {
    const configService = app.get(ConfigService);
    const rmqService = app.get(RabbitMQService);

    const queue = configService.get(queueNameEnv);

    app.connectMicroservice(rmqService.getRmqOptions(queue));
    await app.startAllMicroservices();
    console.log(`[${queue}] Started listening on queue: ${queue}`);
}
