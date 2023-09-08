import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';

import { RabbitMQServiceInterface } from '../interfaces';

@Injectable()
export class RabbitMQService implements RabbitMQServiceInterface {
    constructor(private readonly configService: ConfigService) {}

    getRmqOptions(queue: string, noAck = false): RmqOptions {
        const rabbitmqUrlsEnvName = 'RABBITMQ_URLS';
        const URLS = this.configService.get(rabbitmqUrlsEnvName)?.split(', ');
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
}
