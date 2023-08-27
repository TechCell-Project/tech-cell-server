import { RabbitMQService } from '@app/common';
import { Controller } from '@nestjs/common';
import { CartsMntService } from './carts-mnt.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { CartsMntMessagePattern } from './carts-mnt.pattern';
import { AddCartRequestDTO } from './dtos/create-cart-request.dto';

@Controller('carts-mnt')
export class CartsMntController {
    constructor(
        private readonly cartsMntService: CartsMntService,
        private readonly rabbitmqService: RabbitMQService,
    ) {}

    @MessagePattern(CartsMntMessagePattern.addCart)
    async addCart(
        @Ctx() context: RmqContext,
        @Payload() payload: AddCartRequestDTO & { userId: string },
    ) {
        this.rabbitmqService.acknowledgeMessage(context);
        return this.cartsMntService.addCart(payload);
    }
}
