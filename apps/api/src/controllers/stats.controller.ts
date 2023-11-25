import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { ACCESS_TOKEN_NAME, MANAGEMENTS_SERVICE } from '~libs/common/constants';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
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
import { ModGuard, catchException } from '~libs/common';
import { StatsMntMessagePattern } from '~apps/managements/stats-mnt/stats-mnt.pattern';
import { GetStatsRequestDTO, GetStatsResponseDTO } from '~apps/managements/stats-mnt/dtos';

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
@ApiBearerAuth(ACCESS_TOKEN_NAME)
@UseGuards(ModGuard)
@ApiTags('stats')
@Controller('stats')
export class StatsController {
    constructor(@Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ) {}

    @ApiExcludeEndpoint()
    @Get('ping')
    async getPing() {
        return { message: 'pong' };
    }

    @ApiOperation({
        summary: 'Get stats in a period of time',
    })
    @ApiOkResponse({
        type: GetStatsResponseDTO,
        description: 'Get stats successfully!',
    })
    @Get('/')
    async getStats(@Query() requestQuery: GetStatsRequestDTO) {
        return this.managementsService
            .send(StatsMntMessagePattern.getStats, { ...requestQuery })
            .pipe(catchException());
    }
}
