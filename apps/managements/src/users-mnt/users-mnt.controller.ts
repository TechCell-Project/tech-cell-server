import { Controller, Get, Inject } from '@nestjs/common';
import { MessagePattern, RmqContext, Payload, Ctx } from '@nestjs/microservices';
import { RabbitMQService } from '@app/common';
import { UsersMntService } from './users-mnt.service';
import { GetUsersDTO } from './dtos';
import { UsersMntMessagePattern } from './users-mnt.pattern';

@Controller()
export class UsersMntController {
    constructor(
        @Inject(RabbitMQService) private readonly rabbitMqService: RabbitMQService,
        private readonly usersMntService: UsersMntService,
    ) {}

    @Get('ping')
    getHello() {
        return { message: 'pong' };
    }

    @MessagePattern(UsersMntMessagePattern.getUsers)
    async getUsers(@Ctx() context: RmqContext, @Payload() payload: GetUsersDTO) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.usersMntService.getUsers({ ...payload });
    }

    @MessagePattern(UsersMntMessagePattern.getUserById)
    async getUserById(@Ctx() context: RmqContext, @Payload() payload) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.usersMntService.getUserById({ _id: payload.id });
    }

    @MessagePattern(UsersMntMessagePattern.blockUser)
    async blockUser(@Ctx() context: RmqContext, @Payload() payload) {
        this.rabbitMqService.acknowledgeMessage(context);

        const { victimUserId, blockUserId, blockReason, blockNote } = payload;

        return await this.usersMntService.blockUser({
            victimUserId,
            blockUserId,
            blockReason,
            blockNote,
        });
    }

    @MessagePattern(UsersMntMessagePattern.unblockUser)
    async unblockUser(@Ctx() context: RmqContext, @Payload() payload) {
        this.rabbitMqService.acknowledgeMessage(context);

        const { victimUserId, unblockUserId, unblockReason, unblockNote } = payload;

        return await this.usersMntService.unblockUser({
            victimUserId,
            unblockUserId,
            unblockReason,
            unblockNote,
        });
    }

    @MessagePattern(UsersMntMessagePattern.changeRoleUser)
    async changeRoleUser(@Ctx() context: RmqContext, @Payload() payload) {
        this.rabbitMqService.acknowledgeMessage(context);

        const { victimId, actorId, role } = payload;

        return await this.usersMntService.updateRole({
            victimId,
            actorId,
            role,
        });
    }
}
