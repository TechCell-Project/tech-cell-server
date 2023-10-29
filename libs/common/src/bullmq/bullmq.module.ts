import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

@Module({
    imports: [
        BullModule.forRoot({
            connection: {
                host: process.env.REDIS_HOST,
                port: +process.env.REDIS_PORT,
                password: process.env.REDIS_PASSWORD,
            },
        }),
    ],
    exports: [BullModule],
})
export class BullMqModule {}
