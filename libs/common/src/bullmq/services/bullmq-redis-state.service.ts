import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { BULLMQ_REDIS_STATE_QUEUE } from '../bullmq.constant';
import { RedisStatus } from '../bullmq.type';

@Injectable()
export class BullRedisState implements OnModuleInit {
    private readonly logger = new Logger(BullRedisState.name);
    constructor(@InjectQueue(BULLMQ_REDIS_STATE_QUEUE) private stateQueue: Queue) {}

    async onModuleInit() {
        try {
            await this.delay(1000, 1);
            this.checkQueueAvailability();
        } catch (e) {
            this.logger.error(e);
        }
    }

    async getQueueStatus(): Promise<RedisStatus> {
        return (await this.stateQueue.client).status;
    }

    private async checkQueueAvailability() {
        if ((await this.getQueueStatus()) === 'ready') {
            this.logger.debug(`[${BULLMQ_REDIS_STATE_QUEUE}] BullMQ is connected to Redis`);
            return true;
        } else {
            throw new Error('Redis not available');
        }
    }

    delay(t: number, val: any) {
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve(val);
            }, t);
        });
    }
}
