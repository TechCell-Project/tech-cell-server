import { Controller, Get, Inject, UseGuards, Patch, Body, Query, Param } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { MANAGEMENTS_SERVICE } from '~/constants';
import { ModGuard } from '@app/common/guards';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import {
    ChangeRoleRequestDTO,
    GetUsersDTO,
    UsersMntMessagePattern,
    BlockUnblockRequestDTO,
} from '~/apps/managements/users-mnt';
import { catchException } from '@app/common';
import { UserMntResponseDto } from '@app/resource/users/dtos';

@ApiTags('managements')
@ApiBearerAuth('accessToken')
@ApiForbiddenResponse({ description: 'Forbidden permission, required Mod or Admin' })
@Controller('mnt')
@UseGuards(ModGuard)
export class ManagementsController {
    constructor(@Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ) {}

    @Get('ping')
    async getPing() {
        return { message: 'pong' };
    }

    @ApiOkResponse({ description: 'Get users success', type: [UserMntResponseDto] })
    @ApiNotFoundResponse({ description: 'No users found' })
    @Get('users')
    async getUsers(@Query() requestQuery: GetUsersDTO) {
        return this.managementsService
            .send(UsersMntMessagePattern.getUsers, { ...requestQuery })
            .pipe(catchException());
    }

    @ApiOkResponse({ description: 'Get users success', type: UserMntResponseDto })
    @ApiNotFoundResponse({ description: 'No users found' })
    @Get('users/:id')
    async getUserById(@Param('id') id: string) {
        return this.managementsService
            .send(UsersMntMessagePattern.getUserById, { id })
            .pipe(catchException());
    }

    @ApiOkResponse({ description: 'Block user success', type: UserMntResponseDto })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    @Patch('users/:id/block')
    async blockUser(
        @Param('id') idParam: string,
        @Body() { reason = '', note = '', userId }: BlockUnblockRequestDTO,
    ) {
        return this.managementsService
            .send(UsersMntMessagePattern.blockUser, {
                victimUserId: idParam,
                blockUserId: userId,
                blockReason: reason,
                blockNote: note,
            })
            .pipe(catchException());
    }

    @ApiOkResponse({ description: 'Unblock user success', type: UserMntResponseDto })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    @Patch('users/:id/unblock')
    async unblockUser(
        @Param('id') idParam: string,
        @Body() { reason = '', note = '', userId }: BlockUnblockRequestDTO,
    ) {
        return this.managementsService
            .send(UsersMntMessagePattern.unblockUser, {
                victimUserId: idParam,
                unblockUserId: userId,
                unblockReason: reason,
                unblockNote: note,
            })
            .pipe(catchException());
    }

    @ApiOkResponse({ description: 'Change role user success', type: UserMntResponseDto })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    @Patch('users/:id/change-role')
    async changeRoleUser(
        @Param('id') idParam: string,
        @Body() { role, userId: actorId }: ChangeRoleRequestDTO,
    ) {
        return this.managementsService
            .send(UsersMntMessagePattern.changeRoleUser, { victimId: idParam, actorId, role })
            .pipe(catchException());
    }
}
