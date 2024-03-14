import {
    Controller,
    Get,
    Inject,
    Patch,
    Query,
    Param,
    Body,
    UseGuards,
    Headers,
} from '@nestjs/common';
import { ACCESS_TOKEN_NAME, MANAGEMENTS_SERVICE, StaffGuard } from '~libs/common';
import { ObjectIdParamDTO } from '~libs/common/dtos';
import { ClientRMQ } from '@nestjs/microservices';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import {
    GetOrdersRequestDTO,
    UpdateOrderStatusDTO,
    ListOrderResponseDTO,
} from '~apps/managements/orders-mnt/dtos';
import { OrdersMntMessagePattern } from '~apps/managements/orders-mnt/orders-mnt.pattern';
import { OrderSchemaDTO } from '~libs/resource/orders/dtos/order-schema.dto';
import { GetOrderByIdResponseDTO } from '~apps/managements/orders-mnt/dtos/get-order-by-id-response.dto';
import { sendMessagePipeException } from '~libs/common/RabbitMQ/rmq.util';
import { THeaders } from '~libs/common/types/common.type';

@ApiBadRequestResponse({
    description: 'Invalid request, please check your request data!',
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
@UseGuards(StaffGuard)
@ApiTags('orders management')
@Controller('/orders-mnt')
export class OrdersManagementController {
    constructor(@Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ) {}

    @ApiOperation({ summary: 'Get orders' })
    @ApiOkResponse({
        description: 'Get orders successfully!',
        type: ListOrderResponseDTO,
    })
    @Get('/')
    async getOrders(@Headers() headers: THeaders, @Query() { ...data }: GetOrdersRequestDTO) {
        return sendMessagePipeException<GetOrdersRequestDTO>({
            client: this.managementsService,
            pattern: OrdersMntMessagePattern.getOrders,
            data: { ...data },
            headers,
        });
    }

    @ApiOperation({ summary: 'Get order by id' })
    @ApiOkResponse({ description: 'Get order successfully!', type: GetOrderByIdResponseDTO })
    @Get('/:id')
    async getOrder(@Headers() headers: THeaders, @Param() { id }: ObjectIdParamDTO) {
        return sendMessagePipeException({
            client: this.managementsService,
            pattern: OrdersMntMessagePattern.getOrder,
            data: { orderId: id },
            headers,
        });
    }

    @ApiOperation({ summary: 'Update order status' })
    @ApiOkResponse({ description: 'Update order status successfully!', type: OrderSchemaDTO })
    @Patch('/:id')
    async updateOrderStatus(
        @Headers() headers: THeaders,
        @Param() { id }: ObjectIdParamDTO,
        @Body() { orderStatus }: UpdateOrderStatusDTO,
    ) {
        return sendMessagePipeException({
            client: this.managementsService,
            pattern: OrdersMntMessagePattern.updateOrderStatus,
            data: { orderId: id, orderStatus },
            headers,
        });
    }
}
