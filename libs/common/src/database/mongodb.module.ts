import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleAsyncOptions } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('MONGODB_URI') || process.env.MONGODB_URI,
                retryDelay: 1000,
                connectionFactory: (connection) => {
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    connection.plugin(require('mongoose-autopopulate'));

                    connection.on('connected', () => {
                        Logger.debug(
                            `[Mongodb] is connected: ${connection?.host}/${connection?.name}`,
                        );
                    });
                    connection._events.connected();
                    return connection;
                },
            }),
            inject: [ConfigService],
        }),
    ],
})
export class MongodbModule {
    static setup(uri: string, name?: string, autopopulate?: boolean) {
        const options: MongooseModuleAsyncOptions = {
            connectionName: name ?? undefined,
            useFactory: () => ({
                uri,
                retryDelay: 1000,
                connectionFactory: (connection) => {
                    if (autopopulate) {
                        // eslint-disable-next-line @typescript-eslint/no-var-requires
                        connection.plugin(require('mongoose-autopopulate'));

                        connection.on('connected', () => {
                            Logger.debug(
                                `[Mongodb] is connected: ${connection?.host}/${connection?.name}`,
                            );
                        });
                        connection._events.connected();
                    }
                    return connection;
                },
            }),
        };
        return MongooseModule.forRootAsync(options);
    }
}
