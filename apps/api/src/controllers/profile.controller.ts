import { Body, Controller, Get, Inject, Patch, UseGuards } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { MANAGEMENTS_SERVICE, SEARCH_SERVICE } from '~/constants';
import {
    ApiBearerAuth,
    ApiConsumes,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { AuthGuard, catchException } from '@app/common';
import { CurrentUser } from '@app/common/decorators';
import { TCurrentUser } from '@app/common/types';
import { UserMntResponseDto } from '@app/resource/users/dtos';
import { UsersSearchMessagePattern } from '~/apps/search/users-search';
import { ACCESS_TOKEN_NAME } from '~/constants/api.constant';
import {
    UpdateUserAddressRequestDTO,
    UpdateUserRequestDTO,
    UsersMntMessagePattern,
} from '~/apps/managements/users-mnt';

@ApiBearerAuth(ACCESS_TOKEN_NAME)
@ApiForbiddenResponse({ description: 'Forbidden permission, you need login to access this' })
@UseGuards(AuthGuard)
@ApiTags('profile')
@Controller('/profile')
export class ProfileController {
    constructor(
        @Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ,
        @Inject(SEARCH_SERVICE) private readonly searchService: ClientRMQ,
    ) {}

    @ApiOperation({
        summary: 'Get current user info',
        description: 'Get current user info',
    })
    @ApiOkResponse({ description: 'Get current user info success', type: UserMntResponseDto })
    @Get('/')
    async getProfile(@CurrentUser() user: TCurrentUser) {
        return this.searchService
            .send(UsersSearchMessagePattern.getUserById, { id: user._id })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Update current user info',
        description: 'Update current user info',
    })
    @ApiOkResponse({ description: 'Update current user info success', type: UserMntResponseDto })
    @Patch('/info')
    async updateUserInfo(
        @CurrentUser() user: TCurrentUser,
        @Body() dataUpdate: UpdateUserRequestDTO,
    ) {
        return this.managementsService
            .send(UsersMntMessagePattern.updateUserInfo, { user, dataUpdate })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Update current user address',
        description: 'Update current user address',
    })
    @ApiConsumes('application/json')
    @ApiOkResponse({ description: 'Update current user address success', type: UserMntResponseDto })
    @Patch('/address')
    async updateUserAddress(
        @CurrentUser() user: TCurrentUser,
        @Body() addressData: UpdateUserAddressRequestDTO,
    ) {
        return this.managementsService
            .send(UsersMntMessagePattern.updateUserAddress, { user, addressData })
            .pipe(catchException());
    }
}
