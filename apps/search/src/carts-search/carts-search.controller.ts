import { RabbitMQService } from '@app/common/RabbitMQ';
import { Controller } from '@nestjs/common';
import { CartsSearchService } from './carts-search.service';
import { CartsSearchMessagePattern } from './carts-search.pattern';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { PaginationQuery } from '@app/common/dtos';

@Controller()
export class CartsSearchController {
    constructor(
        private readonly rabbitMqService: RabbitMQService,
        private readonly cartsSearchService: CartsSearchService,
    ) {}

    @MessagePattern(CartsSearchMessagePattern.getCarts)
    async getCarts(
        @Ctx() context: RmqContext,
        @Payload() { ...payload }: PaginationQuery & { userId: string },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.cartsSearchService.getCarts(payload);
    }
}
