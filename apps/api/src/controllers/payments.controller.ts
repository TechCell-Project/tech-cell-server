import { Controller, Inject, Get, Query, Headers } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { ORDER_SERVICE } from '~libs/common/constants';
import {
    ApiBadRequestResponse,
    ApiExcludeController,
    ApiExcludeEndpoint,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiTags,
    ApiTooManyRequestsResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CheckoutMessagePattern } from '~apps/order/checkout-ord/checkout.pattern';
import { VnpayIpnUrlDTO } from '~apps/order/checkout-ord/dtos';
import { sendMessagePipeException } from '~libs/common/RabbitMQ/rmq.util';
import { THeaders } from '~libs/common/types/common.type';

@ApiExcludeController()
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
@ApiTags('payments')
@Controller('payments')
export class PaymentController {
    constructor(@Inject(ORDER_SERVICE) private readonly orderService: ClientRMQ) {}

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
}
