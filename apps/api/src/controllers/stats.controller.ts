import { Controller, Get, Inject, Query, UseGuards, Headers } from '@nestjs/common';
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
import { ModGuard } from '~libs/common';
import { StatsMntMessagePattern } from '~apps/managements/stats-mnt/stats-mnt.pattern';
import { GetStatsRequestDTO, GetStatsResponseDTO } from '~apps/managements/stats-mnt/dtos';
import { sendMessagePipeException } from '~libs/common/RabbitMQ/rmq.util';
import { THeaders } from '~libs/common/types/common.type';
import { GetStatsOrdersApiRequestDTO } from '~apps/managements/stats-mnt/dtos/get-stats-orders-request.2.dto';

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
    async getStats(@Headers() headers: THeaders, @Query() requestQuery: GetStatsRequestDTO) {
        return sendMessagePipeException<GetStatsRequestDTO>({
            client: this.managementsService,
            pattern: StatsMntMessagePattern.getStats,
            data: { ...requestQuery },
            headers,
        });
    }

    @ApiOperation({
        summary: 'Get orders stats in a period of time',
    })
    @ApiOkResponse({
        description: 'Get orders stats successfully!',
    })
    @Get('/orders')
    async getStatsOrders(
        @Headers() headers: THeaders,
        @Query() requestQuery: GetStatsOrdersApiRequestDTO,
    ) {
        return sendMessagePipeException({
            client: this.managementsService,
            pattern: StatsMntMessagePattern.getStatsOrders,
            data: { ...requestQuery },
            headers,
        });
    }
}
