import { Controller, Get, Inject } from '@nestjs/common';
import { MessagePattern, RmqContext, Payload, Ctx } from '@nestjs/microservices';
import { RabbitMQService } from '@app/common';
import { UsersMntService } from './users-mnt.service';
import { GetUsersDTO } from './dtos';

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

    @MessagePattern({ cmd: 'mnt_get_users' })
    async getUsers(@Ctx() context: RmqContext, @Payload() payload: GetUsersDTO) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.usersMntService.getUsers({ ...payload });
    }

    @MessagePattern({ cmd: 'mnt_get_user_by_id' })
    async getUserById(@Ctx() context: RmqContext, @Payload() payload) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.usersMntService.getUserById({ _id: payload.id });
    }
}
