import { Controller } from '@nestjs/common';
import { UsersSearchMessagePattern } from './users-search.pattern';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { GetUsersQueryDTO } from './dtos';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { UsersSearchService } from './users-search.service';

@Controller()
export class UsersSearchController {
    constructor(
        private readonly rabbitMqService: RabbitMQService,
        private readonly usersSearchService: UsersSearchService,
    ) {}

    @MessagePattern(UsersSearchMessagePattern.getUsers)
    async getUsers(@Ctx() context: RmqContext, @Payload() payload: GetUsersQueryDTO) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.usersSearchService.getUsers({ ...payload });
    }

    @MessagePattern(UsersSearchMessagePattern.getUserById)
    async getUserById(@Ctx() context: RmqContext, @Payload() { id }: { id: string }) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.usersSearchService.getUserById(id);
    }
}
