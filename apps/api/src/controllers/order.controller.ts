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
} from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { ACCESS_TOKEN_NAME, ORDER_SERVICE } from '~libs/common/constants';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiExcludeEndpoint,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
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
    ReviewOrderRequestDTO,
    ReviewedOrderResponseDTO,
    VnpayIpnUrlDTO,
} from '~apps/order/checkout-ord/dtos';
import { CreateOrderRequestDTO } from '~apps/order/checkout-ord/dtos/create-order-request.dto';
import { OrderSchemaDTO } from '~libs/resource/orders/dtos/order-schema.dto';
import { sendMessagePipeException } from '~libs/common/RabbitMQ/rmq.util';
import { THeaders } from '~libs/common/types/common.type';

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
    @ApiOperation({ summary: "Get all order's user" })
    @ApiResponse({ description: 'Get all user orders', type: [OrderSchemaDTO] })
    @Get('/')
    async getAllUserOrders(@Headers() headers: THeaders, @CurrentUser() user: TCurrentUser) {
        return sendMessagePipeException({
            client: this.orderService,
            pattern: CheckoutMessagePattern.getAllUserOrders,
            data: { user },
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

    @ApiExcludeEndpoint()
    @Get('/vnpay-ipn')
    async vnpayIpnUrl(@Headers() headers: THeaders, @Query() { ...query }: VnpayIpnUrlDTO) {
        return sendMessagePipeException({
            client: this.orderService,
            pattern: CheckoutMessagePattern.vnpayIpnUrl,
            data: { ...query },
            headers,
        });
    }

    @ApiExcludeEndpoint()
    @Get('/vnpay-return')
    async vnpayReturnUrl(@Headers() headers: THeaders, @Query() { ...query }: VnpayIpnUrlDTO) {
        return sendMessagePipeException({
            client: this.orderService,
            pattern: CheckoutMessagePattern.vnpayReturnUrl,
            data: { ...query },
            headers,
        });
    }
}
