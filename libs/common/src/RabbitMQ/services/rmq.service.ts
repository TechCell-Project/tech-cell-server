import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';

import { RabbitMQServiceInterface } from '../interfaces';

@Injectable()
export class RabbitMQService implements RabbitMQServiceInterface {
    constructor(private readonly configService: ConfigService) {}

    getRmqOptions(queue: string, noAck = false): RmqOptions {
        const URLS = this.configService.get('RABBITMQ_URLS');

        return {
            transport: Transport.RMQ,
            options: {
                urls: [URLS],
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
