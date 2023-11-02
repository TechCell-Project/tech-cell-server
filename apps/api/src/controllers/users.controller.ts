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
import { MANAGEMENTS_SERVICE, SEARCH_SERVICE } from '@app/common/constants';
import { ModGuard, SuperAdminGuard } from '@app/common/guards';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiExcludeEndpoint,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import {
    ChangeRoleRequestDTO,
    UsersMntMessagePattern,
    BlockUnblockRequestDTO,
    CreateUserRequestDto,
} from '~apps/managements/users-mnt';
import { catchException } from '@app/common';
import { UserMntResponseDto } from '@app/resource/users/dtos';
import { CurrentUser } from '@app/common/decorators';
import { TCurrentUser } from '@app/common/types';
import { ListDataResponseDTO } from '@app/common/dtos';
import { UsersSearchMessagePattern } from '~apps/search/users-search';
import { GetUsersQueryDTO } from '~apps/search/users-search/dtos';
import { ACCESS_TOKEN_NAME } from '@app/common/constants/api.constant';

@ApiTags('users (admin only)')
@ApiBearerAuth(ACCESS_TOKEN_NAME)
@ApiForbiddenResponse({ description: 'Forbidden permission, required Mod or Admin' })
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
    @ApiCreatedResponse({ description: 'Create user success', type: UserMntResponseDto })
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
        type: ListDataResponseDTO<UserMntResponseDto>,
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
    @ApiOkResponse({ description: 'Get users success', type: UserMntResponseDto })
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
    @ApiOkResponse({ description: 'Block user success', type: UserMntResponseDto })
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
    @ApiOkResponse({ description: 'Unblock user success', type: UserMntResponseDto })
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
    @ApiOkResponse({ description: 'Change role user success', type: UserMntResponseDto })
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
