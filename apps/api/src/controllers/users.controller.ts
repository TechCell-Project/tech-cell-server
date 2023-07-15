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
import { CurrentUser } from '@app/common/decorators';
import { ICurrentUser } from '@app/common/interfaces';

@ApiTags('users')
@ApiBearerAuth('accessToken')
@ApiForbiddenResponse({ description: 'Forbidden permission, required Mod or Admin' })
@Controller('users')
@UseGuards(ModGuard)
export class UsersController {
    constructor(@Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ) {}

    @ApiOkResponse({ description: 'Get users success', type: [UserMntResponseDto] })
    @ApiNotFoundResponse({ description: 'No users found' })
    @Get('/')
    async getUsers(@Query() requestQuery: GetUsersDTO) {
        return this.managementsService
            .send(UsersMntMessagePattern.getUsers, { ...requestQuery })
            .pipe(catchException());
    }

    @ApiOkResponse({ description: 'Get users success', type: UserMntResponseDto })
    @ApiNotFoundResponse({ description: 'No users found' })
    @Get('/:id')
    async getUserById(@Param('id') id: string) {
        return this.managementsService
            .send(UsersMntMessagePattern.getUserById, { id })
            .pipe(catchException());
    }

    @ApiOkResponse({ description: 'Block user success', type: UserMntResponseDto })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    @Patch('/:id/block')
    async blockUser(
        @Param('id') idParam: string,
        @Body() { reason = '', note = '' }: BlockUnblockRequestDTO,
        @CurrentUser() user: ICurrentUser,
    ) {
        return this.managementsService
            .send(UsersMntMessagePattern.blockUser, {
                victimId: idParam,
                actorId: user._id,
                reason,
                note,
            })
            .pipe(catchException());
    }

    @ApiOkResponse({ description: 'Unblock user success', type: UserMntResponseDto })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    @Patch('/:id/unblock')
    async unblockUser(
        @Param('id') idParam: string,
        @Body() { reason = '', note = '' }: BlockUnblockRequestDTO,
        @CurrentUser() user: ICurrentUser,
    ) {
        return this.managementsService
            .send(UsersMntMessagePattern.unblockUser, {
                victimId: idParam,
                actorId: user._id,
                reason,
                note,
            })
            .pipe(catchException());
    }

    @ApiOkResponse({ description: 'Change role user success', type: UserMntResponseDto })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    @Patch('/:id/change-role')
    async changeRoleUser(
        @Param('id') idParam: string,
        @Body() { role }: ChangeRoleRequestDTO,
        @CurrentUser() user: ICurrentUser,
    ) {
        return this.managementsService
            .send(UsersMntMessagePattern.changeRoleUser, {
                victimId: idParam,
                actorId: user._id,
                role,
            })
            .pipe(catchException());
    }
}
