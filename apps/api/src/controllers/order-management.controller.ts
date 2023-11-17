import { Controller, Get, Inject, Patch, Query, Param, Body, UseGuards } from '@nestjs/common';
import { ACCESS_TOKEN_NAME, MANAGEMENTS_SERVICE, ModGuard, catchException } from '~libs/common';
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
import { OrderSchemaDTO } from '@app/resource/orders/dtos/order-schema.dto';

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
@UseGuards(ModGuard)
@ApiTags('Orders Management')
@Controller('/orders-mnt')
export class OrdersManagementController {
    constructor(@Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ) {}

    @ApiOperation({ summary: 'Get orders' })
    @ApiOkResponse({
        description: 'Get orders successfully!',
        type: ListOrderResponseDTO,
    })
    @Get('/')
    async getOrders(@Query() { ...data }: GetOrdersRequestDTO) {
        return this.managementsService
            .send(OrdersMntMessagePattern.getOrders, { ...data })
            .pipe(catchException());
    }

    @ApiOperation({ summary: 'Get order' })
    @ApiOkResponse({ description: 'Get order successfully!', type: OrderSchemaDTO })
    @Get('/:id')
    async getOrder(@Param() { id }: ObjectIdParamDTO) {
        return this.managementsService
            .send(OrdersMntMessagePattern.getOrder, { orderId: id })
            .pipe(catchException());
    }

    @ApiOperation({ summary: 'Update order status' })
    @ApiOkResponse({ description: 'Update order status successfully!', type: OrderSchemaDTO })
    @Patch('/:id')
    async updateOrderStatus(
        @Param() { id }: ObjectIdParamDTO,
        @Body() { orderStatus }: UpdateOrderStatusDTO,
    ) {
        return this.managementsService
            .send(OrdersMntMessagePattern.updateOrderStatus, { orderId: id, orderStatus })
            .pipe(catchException());
    }
}
