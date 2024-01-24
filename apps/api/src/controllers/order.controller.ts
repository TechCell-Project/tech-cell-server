import {
    Controller,
    Inject,
    UseGuards,
    Post,
    Body,
    HttpCode,
    Get,
    Query,
    Ip,
    Headers,
    Param,
} from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { ACCESS_TOKEN_NAME, ORDER_SERVICE } from '~libs/common/constants';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiTooManyRequestsResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CheckoutMessagePattern } from '~apps/order/checkout-ord/checkout.pattern';
import { AuthGuard } from '~libs/common';
import { CurrentUser } from '~libs/common/decorators';
import { TCurrentUser } from '~libs/common/types';
import {
    GetPaymentUrlRequestDTO,
    GetUserOrdersRequestDTO,
    ListUserOrderResponseDTO,
    ReviewOrderRequestDTO,
    ReviewedOrderResponseDTO,
} from '~apps/order/checkout-ord/dtos';
import { CreateOrderRequestDTO } from '~apps/order/checkout-ord/dtos/create-order-request.dto';
import { OrderSchemaDTO } from '~libs/resource/orders/dtos/order-schema.dto';
import { sendMessagePipeException } from '~libs/common/RabbitMQ/rmq.util';
import { THeaders } from '~libs/common/types/common.type';
import { ObjectIdParamDTO } from '~libs/common/dtos';

@ApiBadRequestResponse({
    description: 'Invalid request, please check your request data!',
})
@ApiNotFoundResponse({
    description: 'Not found data, please try again!',
})
@ApiUnauthorizedResponse({
    description: 'Unauthorized, please login!',
})
@ApiTooManyRequestsResponse({
    description: 'Too many requests, please try again later!',
})
@ApiInternalServerErrorResponse({
    description: 'Internal server error, please try again later!',
})
@ApiBearerAuth(ACCESS_TOKEN_NAME)
@ApiTags('order')
@Controller('order')
export class OrderController {
    constructor(@Inject(ORDER_SERVICE) private readonly orderService: ClientRMQ) {}

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: "Get order's user" })
    @ApiResponse({ description: 'Get user orders', type: ListUserOrderResponseDTO })
    @Get('/')
    async getUserOrders(
        @Headers() headers: THeaders,
        @CurrentUser() user: TCurrentUser,
        @Query() data2Get: GetUserOrdersRequestDTO,
    ) {
        return sendMessagePipeException({
            client: this.orderService,
            pattern: CheckoutMessagePattern.getUserOrders,
            data: { user, data2Get },
            headers,
        });
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: "Get user's order by id" })
    @ApiResponse({ description: "Get user's order by id", type: OrderSchemaDTO })
    @Get('/:id')
    async getUserOrderId(
        @Headers() headers: THeaders,
        @CurrentUser() user: TCurrentUser,
        @Param() { id }: ObjectIdParamDTO,
    ) {
        return sendMessagePipeException({
            client: this.orderService,
            pattern: CheckoutMessagePattern.getUserOrderById,
            data: { user, id },
            headers,
        });
    }

    @UseGuards(AuthGuard)
    @ApiResponse({
        status: 200,
        description: 'Review order before create (for getting the shipping fee, etc...)',
        type: ReviewedOrderResponseDTO,
    })
    @HttpCode(200)
    @ApiOperation({ summary: 'Review a order' })
    @Post('/review')
    async reviewOrder(
        @Headers() headers: THeaders,
        @CurrentUser() user: TCurrentUser,
        @Body() dataReview: ReviewOrderRequestDTO,
    ) {
        return sendMessagePipeException({
            client: this.orderService,
            pattern: CheckoutMessagePattern.reviewOrder,
            data: { user, dataReview },
            headers,
        });
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Create a order' })
    @ApiResponse({ status: 200, description: 'Review order', type: OrderSchemaDTO })
    @HttpCode(200)
    @Post('/')
    async createOrder(
        @Headers() headers: THeaders,
        @Ip() ip: string,
        @CurrentUser() user: TCurrentUser,
        @Body() data2CreateOrder: CreateOrderRequestDTO,
    ) {
        return sendMessagePipeException({
            client: this.orderService,
            pattern: CheckoutMessagePattern.createOrder,
            data: { user, data2CreateOrder, ip },
            headers,
        });
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get order with the newer payment url' })
    @ApiOkResponse({ description: 'Get order with the newer payment url', type: OrderSchemaDTO })
    @Get('/:id/payment-url')
    async getPaymentUrl(
        @Headers() headers: THeaders,
        @CurrentUser() user: TCurrentUser,
        @Ip() ip: string,
        @Param() { id }: ObjectIdParamDTO,
        @Query() { paymentReturnUrl }: GetPaymentUrlRequestDTO,
    ) {
        return sendMessagePipeException({
            client: this.orderService,
            pattern: CheckoutMessagePattern.getPaymentUrl,
            data: { id, user, ip, paymentReturnUrl },
            headers,
        });
    }
}
