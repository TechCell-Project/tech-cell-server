import { Controller } from '@nestjs/common';
import { MessagePattern, RmqContext, Payload, Ctx } from '@nestjs/microservices';
import { RabbitMQService } from '@app/common';
import { UsersMntService } from './users-mnt.service';
import {
    BlockUnblockRequestDTO,
    ChangeRoleRequestDTO,
    CreateUserRequestDto,
    GetUsersDTO,
} from './dtos';
import { UsersMntMessagePattern } from './users-mnt.pattern';

@Controller()
export class UsersMntController {
    constructor(
        private readonly rabbitMqService: RabbitMQService,
        private readonly usersMntService: UsersMntService,
    ) {}

    @MessagePattern(UsersMntMessagePattern.createUser)
    async createUser(
        @Ctx() context: RmqContext,
        @Payload() createUserRequestDto: CreateUserRequestDto,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.usersMntService.createUser({ ...createUserRequestDto });
    }

    @MessagePattern(UsersMntMessagePattern.getUsers)
    async getUsers(@Ctx() context: RmqContext, @Payload() payload: GetUsersDTO) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.usersMntService.getUsers({ ...payload });
    }

    @MessagePattern(UsersMntMessagePattern.getUserById)
    async getUserById(@Ctx() context: RmqContext, @Payload() { id }: { id: string }) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.usersMntService.getUserById({ _id: id });
    }

    @MessagePattern(UsersMntMessagePattern.blockUser)
    async blockUser(
        @Ctx() context: RmqContext,
        @Payload() payload: BlockUnblockRequestDTO & { victimId: string; actorId: string },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);

        const { victimId, actorId, reason, note } = payload;

        return await this.usersMntService.blockUser({
            victimId,
            actorId,
            reason,
            note,
        });
    }

    @MessagePattern(UsersMntMessagePattern.unblockUser)
    async unblockUser(
        @Ctx() context: RmqContext,
        @Payload()
        payload: BlockUnblockRequestDTO & { victimId: string; actorId: string },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);

        const { victimId, actorId, reason, note } = payload;

        return await this.usersMntService.unblockUser({
            victimId,
            actorId,
            reason,
            note,
        });
    }

    @MessagePattern(UsersMntMessagePattern.changeRoleUser)
    async changeRoleUser(
        @Ctx() context: RmqContext,
        @Payload() payload: ChangeRoleRequestDTO & { victimId: string; actorId: string },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);

        const { victimId, actorId, role } = payload;

        return await this.usersMntService.updateRole({
            victimId,
            actorId,
            role,
        });
    }
}
