import { Body, Controller, Get, Inject, Patch, UseGuards } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { MANAGEMENTS_SERVICE, SEARCH_SERVICE } from '~libs/common/constants';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiConsumes,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiTooManyRequestsResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard, catchException } from '~libs/common';
import { CurrentUser } from '~libs/common/decorators';
import { TCurrentUser } from '~libs/common/types';
import { UserMntResponseDTO } from '~libs/resource/users/dtos';
import { UsersSearchMessagePattern } from '~apps/search/users-search';
import { ACCESS_TOKEN_NAME } from '~libs/common/constants/api.constant';
import {
    UpdateUserAddressRequestDTO,
    UpdateUserRequestDTO,
    UsersMntMessagePattern,
} from '~apps/managements/users-mnt';

@ApiBadRequestResponse({
    description: 'Invalid request, please check your request data!',
})
@ApiNotFoundResponse({
    description: 'Not found data, please try again!',
})
@ApiUnauthorizedResponse({
    description: 'Unauthorized, please login!',
})
@ApiForbiddenResponse({
    description: 'Forbidden permission, you need login to access this',
})
@ApiTooManyRequestsResponse({
    description: 'Too many requests, please try again later!',
})
@ApiInternalServerErrorResponse({
    description: 'Internal server error, please try again later!',
})
@ApiBearerAuth(ACCESS_TOKEN_NAME)
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
    @ApiOkResponse({ description: 'Get current user info success', type: UserMntResponseDTO })
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
    @ApiOkResponse({ description: 'Update current user info success', type: UserMntResponseDTO })
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
    @ApiOkResponse({ description: 'Update current user address success', type: UserMntResponseDTO })
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
