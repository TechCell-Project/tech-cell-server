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
import { MANAGEMENTS_SERVICE, SEARCH_SERVICE } from '~/constants';
import { AuthGuard, ModGuard, SuperAdminGuard } from '@app/common/guards';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiHideProperty,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    ChangeRoleRequestDTO,
    UsersMntMessagePattern,
    BlockUnblockRequestDTO,
    CreateUserRequestDto,
} from '~/apps/managements/users-mnt';
import { catchException } from '@app/common';
import { UserMntResponseDto } from '@app/resource/users/dtos';
import { CurrentUser } from '@app/common/decorators';
import { ICurrentUser } from '@app/common/interfaces';
import { ListDataResponseDTO } from '@app/common/dtos';
import { UsersSearchMessagePattern } from '~/apps/search/users-search';
import { GetUsersDTO } from '~/apps/search/users-search/dtos';

@ApiTags('users')
@ApiBearerAuth('accessToken')
@ApiForbiddenResponse({ description: 'Forbidden permission, required Mod or Admin' })
@Controller('users')
export class UsersController {
    constructor(
        @Inject(SEARCH_SERVICE) private readonly searchService: ClientRMQ,
        @Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ,
    ) {}

    @ApiCreatedResponse({ description: 'Create user success', type: UserMntResponseDto })
    @UseGuards(SuperAdminGuard)
    @Post('/')
    async createUser(@Body() createUserRequestDto: CreateUserRequestDto) {
        return this.managementsService
            .send(UsersMntMessagePattern.createUser, { ...createUserRequestDto })
            .pipe(catchException());
    }

    @ApiOkResponse({ description: 'Get users success', type: ListDataResponseDTO })
    @ApiNotFoundResponse({ description: 'No users found' })
    @UseGuards(ModGuard)
    @Get('/')
    async getUsers(@Query() requestQuery: GetUsersDTO) {
        return this.searchService
            .send(UsersSearchMessagePattern.getUsers, { ...requestQuery })
            .pipe(catchException());
    }

    @ApiOkResponse({ description: 'Get current user info success', type: UserMntResponseDto })
    @UseGuards(AuthGuard)
    @Get('/me')
    async getMe(@CurrentUser() user: ICurrentUser) {
        return this.searchService
            .send(UsersSearchMessagePattern.getUserById, { id: user._id })
            .pipe(catchException());
    }

    @ApiOkResponse({ description: 'Get users success', type: UserMntResponseDto })
    @ApiNotFoundResponse({ description: 'No users found' })
    @UseGuards(ModGuard)
    @Get('/:id')
    async getUserById(@Param('id') id: string) {
        return this.searchService
            .send(UsersSearchMessagePattern.getUserById, { id })
            .pipe(catchException());
    }

    @ApiOkResponse({ description: 'Block user success', type: UserMntResponseDto })
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    @UseGuards(ModGuard)
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
    @UseGuards(ModGuard)
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
    @UseGuards(ModGuard)
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

    @ApiHideProperty()
    @UseGuards(SuperAdminGuard)
    @Post('/gen-clone')
    async gen(@Query() { num }: { num: number }) {
        return this.managementsService
            .send(UsersMntMessagePattern.generateUsers, { num })
            .pipe(catchException());
    }
}
