import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

import { RabbitMQService } from './services';

@Module({
    providers: [RabbitMQService],
    exports: [RabbitMQService],
})
export class RabbitMQModule {
    static registerRmq(service: string, queue: string): DynamicModule {
        const providers = [
            {
                provide: service,
                useFactory: (configService: ConfigService) => {
                    const URLS =
                        configService.get('RABBITMQ_URLS')?.split(', ') ||
                        process.env.RABBITMQ_URLS?.split(', ');

                    return ClientProxyFactory.create({
                        transport: Transport.RMQ,
                        options: {
                            urls: URLS,
                            queue,
                            queueOptions: {
                                durable: true, // queue survives broker restart
                            },
                        },
                    });
                },
                inject: [ConfigService],
            },
        ];

        return {
            module: RabbitMQModule,
            providers,
            exports: providers,
        };
    }
}
