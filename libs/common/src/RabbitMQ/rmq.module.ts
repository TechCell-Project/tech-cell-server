import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { RabbitMQService } from './services';
import { RmqStateService } from './services/rmq-state.service';

@Module({
    imports: [RabbitMQModule.registerRmq('TEST_STATE_RMQ', 'test_state_rmq_queue')],
    providers: [RabbitMQService, RmqStateService],
    exports: [RabbitMQService],
})
export class RabbitMQModule {
    static registerRmq(service: string, queue: string): DynamicModule {
        const providers = [
            {
                provide: service,
                useFactory: (configService: ConfigService) => {
                    const URLS =
                        configService
                            .get<string>('RABBITMQ_URLS')
                            ?.split(',')
                            ?.map((url: string) => url?.trim()) ||
                        process.env.RABBITMQ_URLS?.split(',')?.map((url) => url?.trim());

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
