import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';

@Injectable()
export class RmqStateService implements OnModuleInit {
    private readonly logger = new Logger(RmqStateService.name);
    constructor(@Inject('TEST_STATE_RMQ') private readonly testStateRqm: ClientRMQ) {}

    async onModuleInit() {
        await this.checkRmqConnection();
    }

    private async checkRmqConnection() {
        try {
            await this.testStateRqm.connect();
            this.logger.debug(`RMQ client connected`);
        } catch (error) {
            this.logger.error(`Unable to connect to RMQ`, error);
        }
    }
}
