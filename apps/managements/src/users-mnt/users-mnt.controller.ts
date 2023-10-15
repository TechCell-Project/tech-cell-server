import { Controller } from '@nestjs/common';
import { MessagePattern, RmqContext, Payload, Ctx } from '@nestjs/microservices';
import { RabbitMQService } from '@app/common';
import { UsersMntService } from './users-mnt.service';
import {
    BlockUnblockRequestDTO,
    ChangeRoleRequestDTO,
    CreateUserRequestDto,
    UpdateUserRequestDTO,
} from './dtos';
import { UsersMntMessagePattern } from './users-mnt.pattern';
import { TCurrentUser } from '@app/common/types';

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

    @MessagePattern(UsersMntMessagePattern.generateUsers)
    async generateUsers(@Ctx() context: RmqContext, @Payload() payload: { num: number }) {
        this.rabbitMqService.acknowledgeMessage(context);
        const { num } = payload;
        return await this.usersMntService.generateUsers(num);
    }

    @MessagePattern(UsersMntMessagePattern.updateUserInfo)
    async updateUserInfo(
        @Ctx() context: RmqContext,
        @Payload()
        { user, dataUpdate }: { user: TCurrentUser; dataUpdate: UpdateUserRequestDTO },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.usersMntService.updateUserInfo({ user, dataUpdate });
    }
}
