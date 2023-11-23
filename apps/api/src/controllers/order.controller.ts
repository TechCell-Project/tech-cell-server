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
import { AuthGuard, catchException } from '~libs/common';
import { CurrentUser } from '~libs/common/decorators';
import { TCurrentUser } from '~libs/common/types';
import {
    ReviewOrderRequestDTO,
    ReviewedOrderResponseDTO,
    VnpayIpnUrlDTO,
} from '~apps/order/checkout-ord/dtos';
import { CreateOrderRequestDTO } from '~apps/order/checkout-ord/dtos/create-order-request.dto';
import { OrderSchemaDTO } from '~libs/resource/orders/dtos/order-schema.dto';

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
    async getAllUserOrders(@CurrentUser() user: TCurrentUser) {
        return this.orderService
            .send(CheckoutMessagePattern.getAllUserOrders, { user })
            .pipe(catchException());
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
        @CurrentUser() user: TCurrentUser,
        @Body() dataReview: ReviewOrderRequestDTO,
    ) {
        return this.orderService
            .send(CheckoutMessagePattern.reviewOrder, { user, dataReview })
            .pipe(catchException());
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Create a order' })
    @ApiResponse({ status: 200, description: 'Review order', type: OrderSchemaDTO })
    @HttpCode(200)
    @Post('/')
    async createOrder(
        @Ip() ip: string,
        @CurrentUser() user: TCurrentUser,
        @Body() data2CreateOrder: CreateOrderRequestDTO,
    ) {
        return this.orderService
            .send(CheckoutMessagePattern.createOrder, { user, data2CreateOrder, ip })
            .pipe(catchException());
    }

    @ApiExcludeEndpoint()
    @Get('/vnpay-ipn')
    async vnpayIpnUrl(@Query() { ...query }: VnpayIpnUrlDTO) {
        return this.orderService
            .send(CheckoutMessagePattern.vnpayIpnUrl, { ...query })
            .pipe(catchException());
    }

    @ApiExcludeEndpoint()
    @Get('/vnpay-return')
    async vnpayReturnUrl(@Query() { ...query }: VnpayIpnUrlDTO) {
        return this.orderService
            .send(CheckoutMessagePattern.vnpayReturnUrl, { ...query })
            .pipe(catchException());
    }
}
