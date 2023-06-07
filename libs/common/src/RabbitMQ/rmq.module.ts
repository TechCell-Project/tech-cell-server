import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

import { RabbitMQService } from './services';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env',
        }),
    ],
    providers: [RabbitMQService],
    exports: [RabbitMQService],
})
export class RabbitMQModule {
    static registerRmq(service: string, queue: string): DynamicModule {
        const providers = [
            {
                provide: service,
                useFactory: (configService: ConfigService) => {
                    const URLS = configService.get('RABBITMQ_URLS');

                    return ClientProxyFactory.create({
                        transport: Transport.RMQ,
                        options: {
                            urls: [URLS],
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
