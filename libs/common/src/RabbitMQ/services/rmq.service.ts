import { INestApplication, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';
import { RabbitMQServiceInterface } from '../interfaces';

@Injectable()
export class RabbitMQService implements RabbitMQServiceInterface {
    constructor(private readonly configService: ConfigService) {}

    /**
     * @param app ISNestApplication instance
     * @param queueNameEnv A environment variable which is defined in the .env file that is used to configure the RabbitMQ queue name
     * @param inheritAppConfig A boolean value that indicates whether the microservice should inherit the application configuration
     * @returns A promise that resolves when the application is initialized
     */
    static connectRabbitMQ(app: INestApplication, queueNameEnv: string, inheritAppConfig = false) {
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
            Logger.log(`⚡️ Config microservice successfully, listen on: ${queue}`);
        } catch (error) {
            Logger.error(`⚡️ Config failed: ${error});`);
        }
    }

    getRmqOptions(queue: string, noAck = false): RmqOptions {
        const rabbitmqUrlsEnvName = 'RABBITMQ_URLS';
        const URLS = this.configService.getOrThrow(rabbitmqUrlsEnvName)?.split(', ');
        if (!URLS) {
            throw new Error(`Urls rabbitmq env is not set:: ${rabbitmqUrlsEnvName}`);
        }
        return {
            transport: Transport.RMQ,
            options: {
                urls: URLS,
                noAck,
                queue,
                queueOptions: {
                    durable: true,
                },
            },
        };
    }

    acknowledgeMessage(context: RmqContext) {
        const channel = context.getChannelRef();
        const message = context.getMessage();
        channel.ack(message);
    }

    getHeaders(context: RmqContext) {
        const message = context.getMessage();
        return message?.properties?.headers;
    }
}
