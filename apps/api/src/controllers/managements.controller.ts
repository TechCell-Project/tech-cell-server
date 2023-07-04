import { Controller, Get, Inject, Request, UseGuards, Patch, Body } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { MANAGEMENTS_SERVICE } from '~/constants';
import { ModGuard } from '@app/common/guards';
import { ApiTags } from '@nestjs/swagger';
import { ChangeRoleRequestDTO, GetUsersDTO } from '~/apps/managements/users-mnt/dtos';
import { catchException } from '@app/common';

@ApiTags('managements')
@Controller('mnt')
@UseGuards(ModGuard)
export class ManagementsController {
    constructor(@Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ) {}

    @Get('ping')
    async getPing() {
        return { message: 'pong' };
    }

    @Get('users')
    async getUser(@Request() req) {
        const reqQuery: GetUsersDTO = req.query;
        return this.managementsService
            .send({ cmd: 'mnt_get_users' }, { ...reqQuery })
            .pipe(catchException());
    }

    @Get('users/:id')
    async getUserById(@Request() req) {
        const { id } = req.params;
        return this.managementsService
            .send({ cmd: 'mnt_get_user_by_id' }, { id })
            .pipe(catchException());
    }

    @Patch('users/:id/block')
    async blockUser(@Request() req) {
        const { id: victimUserId } = req.params;
        const { blockReason = '', blockNote = '', userId } = req.body;
        return this.managementsService
            .send(
                { cmd: 'mnt_block_user' },
                { victimUserId, blockUserId: userId, blockReason, blockNote },
            )
            .pipe(catchException());
    }

    @Patch('users/:id/unblock')
    async unblockUser(@Request() req) {
        const { id: victimUserId } = req.params;
        const { userId, unblockReason = '', unblockNote = '' } = req.body;
        return this.managementsService
            .send(
                { cmd: 'mnt_unblock_user' },
                { victimUserId, unblockUserId: userId, unblockReason, unblockNote },
            )
            .pipe(catchException());
    }

    @Patch('users/:id/change-role')
    async changeRoleUser(@Request() req, @Body() { userId, role }: ChangeRoleRequestDTO) {
        const { id: victimId } = req.params;
        return this.managementsService
            .send({ cmd: 'mnt_change_role_user' }, { victimId, actorId: userId, role })
            .pipe(catchException());
    }
}
