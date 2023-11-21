import { RabbitMQService } from '~libs/common/RabbitMQ';
import { Controller } from '@nestjs/common';
import { CartsOrdService } from './carts-ord.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { CartsOrdMessagePattern } from './carts-ord.pattern';
import { AddCartRequestDTO } from './dtos/create-cart-request.dto';
import { PaginationQuery } from '~libs/common/dtos';
import { TCurrentUser } from '~libs/common/types';
import { DeleteProductsCartRequestDTO } from './dtos';

@Controller('carts')
export class CartsOrdController {
    constructor(
        private readonly cartsService: CartsOrdService,
        private readonly rabbitmqService: RabbitMQService,
    ) {}

    @MessagePattern(CartsOrdMessagePattern.getCarts)
    async getCarts(
        @Ctx() context: RmqContext,
        @Payload() payload: { query: PaginationQuery; user: TCurrentUser },
    ) {
        this.rabbitmqService.acknowledgeMessage(context);
        return this.cartsService.getCarts(payload);
    }

    @MessagePattern(CartsOrdMessagePattern.addCart)
    async addCart(
        @Ctx() context: RmqContext,
        @Payload() { cartData, user }: { cartData: AddCartRequestDTO; user: TCurrentUser },
    ) {
        this.rabbitmqService.acknowledgeMessage(context);
        return this.cartsService.addProductToCart({ cartData, user });
    }

    @MessagePattern(CartsOrdMessagePattern.deleteProductsCart)
    async deleteProductsCart(
        @Ctx() context: RmqContext,
        @Payload()
        { cartsData, user }: { cartsData: DeleteProductsCartRequestDTO; user: TCurrentUser },
    ) {
        this.rabbitmqService.acknowledgeMessage(context);
        return this.cartsService.deleteProductsCart({ cartsData, user });
    }
}
