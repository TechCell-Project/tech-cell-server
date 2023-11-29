import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { BULLMQ_REDIS_STATE_QUEUE } from './bullmq.constant';
import { BullRedisState } from './services/bullmq-redis-state.service';

@Module({
    imports: [
        BullModule.forRoot({
            connection: {
                host: process.env.REDIS_HOST,
                port: +process.env.REDIS_PORT,
                password: process.env.REDIS_PASSWORD,
            },
        }),
        BullModule.registerQueue({
            name: BULLMQ_REDIS_STATE_QUEUE,
        }),
    ],
    providers: [BullRedisState],
    exports: [BullModule, BullRedisState],
})
export class BullMqModule {}
