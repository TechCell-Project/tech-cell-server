import { PickType } from '@nestjs/swagger';
import { CreateOrderRequestDTO } from './create-order-request.dto';

export class GetPaymentUrlRequestDTO extends PickType(CreateOrderRequestDTO, [
    'paymentReturnUrl',
]) {}
