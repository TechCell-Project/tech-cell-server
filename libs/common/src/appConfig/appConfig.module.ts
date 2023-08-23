import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

/**
 * @description This module is used to load environment variables from .env file
 * @see https://docs.nestjs.com/techniques/configuration
 * @exports AppConfigModule - This module is used to load environment variables from .env file
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: process.env.NODE_ENV === 'production' ? './.env.prod' : './.env',
        }),
    ],
    exports: [ConfigModule],
})
export class AppConfigModule {}
