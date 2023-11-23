import {
    Controller,
    Get,
    Inject,
    UseGuards,
    Patch,
    Body,
    Query,
    Param,
    Post,
} from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { MANAGEMENTS_SERVICE, SEARCH_SERVICE } from '~libs/common/constants';
import { ModGuard, SuperAdminGuard } from '~libs/common/guards';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiExcludeEndpoint,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiTooManyRequestsResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
    ChangeRoleRequestDTO,
    UsersMntMessagePattern,
    BlockUnblockRequestDTO,
    CreateUserRequestDto,
} from '~apps/managements/users-mnt';
import { catchException } from '~libs/common';
import { UserMntResponseDTO } from '~libs/resource/users/dtos';
import { CurrentUser } from '~libs/common/decorators';
import { TCurrentUser } from '~libs/common/types';
import { UsersSearchMessagePattern } from '~apps/search/users-search';
import { GetUsersQueryDTO, ListUserResponseDTO } from '~apps/search/users-search/dtos';
import { ACCESS_TOKEN_NAME } from '~libs/common/constants/api.constant';

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
    description: 'Forbidden permission, required Mod or Admin',
})
@ApiTooManyRequestsResponse({
    description: 'Too many requests, please try again later!',
})
@ApiInternalServerErrorResponse({
    description: 'Internal server error, please try again later!',
})
@ApiTags('users management')
@ApiBearerAuth(ACCESS_TOKEN_NAME)
@Controller('users')
export class UsersController {
    constructor(
        @Inject(SEARCH_SERVICE) private readonly searchService: ClientRMQ,
        @Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ,
    ) {}

    @ApiOperation({
        summary: 'Create new user',
        description: 'Create new user',
    })
    @ApiCreatedResponse({ description: 'Create user success', type: UserMntResponseDTO })
    @UseGuards(SuperAdminGuard)
    @Post('/')
    async createUser(@Body() createUserRequestDto: CreateUserRequestDto) {
        return this.managementsService
            .send(UsersMntMessagePattern.createUser, { ...createUserRequestDto })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Get list of users',
        description: 'Get list of users',
    })
    @ApiOkResponse({
        description: 'Get users success',
        type: ListUserResponseDTO,
    })
    @ApiNotFoundResponse({ description: 'No users found' })
    @UseGuards(ModGuard)
    @Get('/')
    async getUsers(@Query() requestQuery: GetUsersQueryDTO) {
        return this.searchService
            .send(UsersSearchMessagePattern.getUsers, { ...requestQuery })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Get user by id',
        description: 'Get user by id',
    })
    @ApiOkResponse({ description: 'Get users success', type: UserMntResponseDTO })
    @ApiNotFoundResponse({ description: 'No users found' })
    @UseGuards(ModGuard)
    @Get('/:id')
    async getUserById(@Param('id') id: string) {
        return this.searchService
            .send(UsersSearchMessagePattern.getUserById, { id })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Block user',
        description: 'Block user',
    })
    @ApiOkResponse({ description: 'Block user success', type: UserMntResponseDTO })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    @UseGuards(ModGuard)
    @Patch('/:id/block')
    async blockUser(
        @Param('id') idParam: string,
        @Body() { reason = '', note = '' }: BlockUnblockRequestDTO,
        @CurrentUser() user: TCurrentUser,
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

    @ApiOperation({
        summary: 'Unblock user',
        description: 'Unblock user',
    })
    @ApiOkResponse({ description: 'Unblock user success', type: UserMntResponseDTO })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    @UseGuards(ModGuard)
    @Patch('/:id/unblock')
    async unblockUser(
        @Param('id') idParam: string,
        @Body() { reason = '', note = '' }: BlockUnblockRequestDTO,
        @CurrentUser() user: TCurrentUser,
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

    @ApiOperation({
        summary: 'Change role user',
        description: 'Change role user',
    })
    @ApiOkResponse({ description: 'Change role user success', type: UserMntResponseDTO })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    @UseGuards(ModGuard)
    @Patch('/:id/change-role')
    async changeRoleUser(
        @Param('id') idParam: string,
        @Body() { role }: ChangeRoleRequestDTO,
        @CurrentUser() user: TCurrentUser,
    ) {
        return this.managementsService
            .send(UsersMntMessagePattern.changeRoleUser, {
                victimId: idParam,
                actorId: user._id,
                role,
            })
            .pipe(catchException());
    }

    @ApiExcludeEndpoint(true)
    @UseGuards(SuperAdminGuard)
    @Post('/gen-clone')
    async gen(@Query() { num }: { num: number }) {
        return this.managementsService
            .send(UsersMntMessagePattern.generateUsers, { num })
            .pipe(catchException());
    }
}
