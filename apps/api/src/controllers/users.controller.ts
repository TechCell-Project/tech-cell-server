import { Controller, Get, Inject, Patch, Body, Query, Param, Post, Headers } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { MANAGEMENTS_SERVICE, SEARCH_SERVICE } from '~libs/common/constants';
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
    UsersMntMessagePattern,
    BlockUnblockRequestDTO,
    CreateUserRequestDto,
} from '~apps/managements/users-mnt';
import { UserMntResponseDTO } from '~libs/resource/users/dtos';
import { Auth, CurrentUser } from '~libs/common/decorators';
import { TCurrentUser } from '~libs/common/types';
import { UsersSearchMessagePattern } from '~apps/search/users-search';
import { GetUsersQueryDTO, ListUserResponseDTO } from '~apps/search/users-search/dtos';
import { ACCESS_TOKEN_NAME } from '~libs/common/constants/api.constant';
import { sendMessagePipeException } from '~libs/common/RabbitMQ/rmq.util';
import { THeaders } from '~libs/common/types/common.type';
import { UserRole } from '~libs/resource/users/enums';

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

    @Auth(UserRole.Manager)
    @ApiOperation({
        summary: 'Create new user',
        description: 'Create new user',
    })
    @ApiCreatedResponse({ description: 'Create user success', type: UserMntResponseDTO })
    @Post('/')
    async createUser(
        @Headers() headers: THeaders,
        @Body() createUserRequestDto: CreateUserRequestDto,
    ) {
        return sendMessagePipeException({
            client: this.managementsService,
            pattern: UsersMntMessagePattern.createUser,
            data: { ...createUserRequestDto },
            headers,
        });
    }

    @Auth(UserRole.Manager)
    @ApiOperation({
        summary: 'Get list of users',
        description: 'Get list of users',
    })
    @ApiOkResponse({
        description: 'Get users success',
        type: ListUserResponseDTO,
    })
    @ApiNotFoundResponse({ description: 'No users found' })
    @Get('/')
    async getUsers(@Headers() headers: THeaders, @Query() requestQuery: GetUsersQueryDTO) {
        return sendMessagePipeException<GetUsersQueryDTO>({
            client: this.searchService,
            pattern: UsersSearchMessagePattern.getUsers,
            data: { ...requestQuery },
            headers,
        });
    }
    @Auth(UserRole.Manager, UserRole.Staff, UserRole.User)
    @ApiOperation({
        summary: 'Get user by id',
        description: 'Get user by id',
    })
    @ApiOkResponse({ description: 'Get users success', type: UserMntResponseDTO })
    @ApiNotFoundResponse({ description: 'No users found' })
    @Get('/:id')
    async getUserById(@Headers() headers: THeaders, @Param('id') id: string) {
        return sendMessagePipeException({
            client: this.searchService,
            pattern: UsersSearchMessagePattern.getUserById,
            data: { id },
            headers,
        });
    }

    @Auth(UserRole.Manager)
    @ApiOperation({
        summary: 'Block user',
        description: 'Block user',
    })
    @ApiOkResponse({ description: 'Block user success', type: UserMntResponseDTO })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    @Patch('/:id/block')
    async blockUser(
        @Headers() headers: THeaders,
        @Param('id') idParam: string,
        @Body() { reason = '', note = '' }: BlockUnblockRequestDTO,
        @CurrentUser() user: TCurrentUser,
    ) {
        return sendMessagePipeException({
            client: this.managementsService,
            pattern: UsersMntMessagePattern.blockUser,
            data: {
                victimId: idParam,
                actorId: user._id,
                reason,
                note,
            },
            headers,
        });
    }

    @Auth(UserRole.Manager)
    @ApiOperation({
        summary: 'Unblock user',
        description: 'Unblock user',
    })
    @ApiOkResponse({ description: 'Unblock user success', type: UserMntResponseDTO })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    @Patch('/:id/unblock')
    async unblockUser(
        @Headers() headers: THeaders,
        @Param('id') idParam: string,
        @Body() { reason = '', note = '' }: BlockUnblockRequestDTO,
        @CurrentUser() user: TCurrentUser,
    ) {
        return sendMessagePipeException({
            client: this.managementsService,
            pattern: UsersMntMessagePattern.unblockUser,
            data: {
                victimId: idParam,
                actorId: user._id,
                reason,
                note,
            },
            headers,
        });
    }

    @Auth(UserRole.Manager)
    @ApiExcludeEndpoint(true)
    @ApiOperation({
        summary: 'Change role user',
        description: 'Change role user',
    })
    @ApiOkResponse({ description: 'Change role user success', type: UserMntResponseDTO })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    @Patch('/:id/change-role')
    async changeRoleUser() {
        // @Headers() headers: THeaders, @Param('id') idParam: string,@Body() { role }: ChangeRoleRequestDTO,@CurrentUser() user: TCurrentUser,
        return {
            message: 'Endpoint excluded',
        };
        // return sendMessagePipeException({
        //     client: this.managementsService,
        //     pattern: UsersMntMessagePattern.changeRoleUser,
        //     data: {
        //         victimId: idParam,
        //         actorId: user._id,
        //         role,
        //     },
        //     headers,
        // });
    }

    @Auth(UserRole.Manager)
    @ApiExcludeEndpoint(true)
    @Post('/gen-clone')
    async gen(@Headers() headers: THeaders, @Query() { num }: { num: number }) {
        return sendMessagePipeException({
            client: this.managementsService,
            pattern: UsersMntMessagePattern.generateUsers,
            data: { num },
            headers,
        });
    }
}
