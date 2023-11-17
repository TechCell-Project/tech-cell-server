import { REDIS_CLIENT } from '~libs/common/constants';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import Redlock, { Lock, ExecutionResult, ExecutionError } from 'redlock';

@Injectable()
export class RedlockService {
    private readonly redLock: Redlock;
    private readonly logger: Logger;
    constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {
        this.redLock = new Redlock([this.redisClient], {
            driftFactor: 0.01,
            retryCount: 10,
            retryDelay: 50,
            retryJitter: 200,
        });
        this.logger = new Logger(RedlockService.name);
    }

    public async lock(resources: string[], ttl: number): Promise<Lock> {
        return await this.redLock
            .acquire(resources, ttl)
            .then((lock) => {
                this.logger.debug(`Acquired lock: '${lock.resources.join(', ')}'`);
                return lock;
            })
            .catch((err: ExecutionError) => {
                if (
                    err.message ===
                    'The operation was unable to achieve a quorum during its retry window.'
                ) {
                    throw new ExecutionError(
                        `Cannot lock: '${resources.join(', ')}'`,
                        err.attempts,
                    );
                }

                this.logger.error(err);
                throw err;
            });
    }

    public async extend(lock: Lock, ttl: number): Promise<Lock> {
        return await lock
            .extend(ttl)
            .then((lock) => {
                this.logger.debug(`Extend lock: '${lock.resources.join(', ')}'`);
                return lock;
            })
            .catch((err: ExecutionError) => {
                throw err;
            });
    }

    public async unlock(lock: Lock): Promise<ExecutionResult> {
        return await lock.release().then((result) => {
            if (result) {
                this.logger.debug(`Released lock: '${lock.resources.join(', ')}'`);
            }
            return result;
        });
    }
}
