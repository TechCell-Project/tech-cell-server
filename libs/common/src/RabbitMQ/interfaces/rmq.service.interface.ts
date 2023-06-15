import { RmqContext, RmqOptions } from '@nestjs/microservices';

export interface RabbitMQServiceInterface {
    getRmqOptions(queue: string): RmqOptions;
    acknowledgeMessage(context: RmqContext): void;
}
