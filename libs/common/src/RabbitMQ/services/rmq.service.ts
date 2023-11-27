import { INestApplication, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';
import { RabbitMQServiceInterface } from '../interfaces';

@Injectable()
export class RabbitMQService implements RabbitMQServiceInterface {
    constructor(private readonly configService: ConfigService) {}

    /**
     * @description Connect to microservice using RabbitMQ
     * @property {INestApplication} app - Nest application instance
     * @property {string} queueNameEnv - Environment variable name for queue name
     * @property {boolean} inheritAppConfig - Inherit app config
     * @property {Logger} logger - Logger instance
     * @returns {void}
     */
    static connectRabbitMQ({
        app,
        queueNameEnv,
        inheritAppConfig = false,
        logger = new Logger(RabbitMQService.name),
    }: {
        app: INestApplication;
        queueNameEnv: string;
        inheritAppConfig?: boolean;
        logger?: Logger;
    }): void {
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
