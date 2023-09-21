import { Controller, Inject, Get, Request } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { ORDER_SERVICE } from '~/constants';
import { ApiExcludeController, ApiTags } from '@nestjs/swagger';

@ApiExcludeController()
@ApiTags('order')
@Controller('order')
export class OrderController {
    constructor(@Inject(ORDER_SERVICE) private readonly orderService: ClientRMQ) {}

    @Get('vnpay/return')
    async vnpayReturn(@Request() req) {
        return JSON.stringify(req.query);
    }
}
