import { Body, Controller, Get, Headers, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { ACCESS_TOKEN_NAME, MANAGEMENTS_SERVICE } from '~libs/common/constants';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiExcludeController,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiTooManyRequestsResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
    CreateKpiRequestDTO,
    GetKpisRequestDTO,
    KpiMntMessagePattern,
    ListKpisResponseDTO,
    UpdateKpiRequestDTO,
} from '~apps/managements/kpi-mnt';
import { THeaders } from '~libs/common/types';
import { sendMessagePipeException } from '~libs/common/RabbitMQ/rmq.util';
import { KpiDTO } from '~libs/resource/kpi';
import { ObjectIdParamDTO } from '~libs/common/dtos';

@ApiExcludeController()
@ApiBadRequestResponse({
    description: 'Invalid request, please check your request data!',
})
@ApiUnauthorizedResponse({
    description: 'Unauthorized, please login!',
})
@ApiNotFoundResponse({
    description: 'Not found data, please try again!',
})
@ApiTooManyRequestsResponse({
    description: 'Too many requests, please try again later!',
})
@ApiInternalServerErrorResponse({
    description: 'Internal server error, please try again later!',
})
@ApiBearerAuth(ACCESS_TOKEN_NAME)
@ApiTags('kpi')
@Controller('kpi')
export class KpiController {
    constructor(@Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ) {}

    @ApiCreatedResponse({
        description: 'Created kpi successfully!',
        type: KpiDTO,
    })
    @ApiOperation({ summary: 'Create kpi' })
    @Post('/')
    async createKpi(@Headers() headers: THeaders, @Body() data: CreateKpiRequestDTO) {
        return sendMessagePipeException({
            client: this.managementsService,
            pattern: KpiMntMessagePattern.createKpi,
            data: data,
            headers,
        });
    }

    @ApiOkResponse({
        description: 'Get kpis successfully!',
        type: ListKpisResponseDTO,
    })
    @ApiOperation({ summary: 'Get kpis' })
    @Get('/')
    async getKpis(@Headers() headers: THeaders, @Query() data: GetKpisRequestDTO) {
        return sendMessagePipeException({
            client: this.managementsService,
            pattern: KpiMntMessagePattern.getKpis,
            data: data,
            headers,
        });
    }

    @ApiOkResponse({
        description: 'Get kpi successfully!',
        type: KpiDTO,
    })
    @ApiOperation({ summary: 'Get kpi' })
    @Get('/:id')
    async getKpi(@Headers() headers: THeaders, @Param() { id }: ObjectIdParamDTO) {
        return sendMessagePipeException({
            client: this.managementsService,
            pattern: KpiMntMessagePattern.getKpiById,
            data: { id },
            headers,
        });
    }

    @ApiOkResponse({
        description: 'Update kpi successfully!',
        type: KpiDTO,
    })
    @ApiOperation({ summary: 'Update kpi' })
    @Patch('/:id')
    async updateKpi(
        @Headers() headers: THeaders,
        @Param() { id }: ObjectIdParamDTO,
        @Body() body: UpdateKpiRequestDTO,
    ) {
        return sendMessagePipeException({
            client: this.managementsService,
            pattern: KpiMntMessagePattern.updateKpi,
            data: { id, ...body },
            headers,
        });
    }
}
