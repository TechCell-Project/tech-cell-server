import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';
import { DiscountsMntMessagePattern } from './discounts-mnt.pattern';
import { DiscountsMntService } from './discounts-mnt.service';
import { CreateDiscountRequestDTO } from './dtos';
import { RabbitMQService } from '~libs/common/RabbitMQ';

@Controller()
export class DiscountsMntController {
    constructor(
        private readonly discountsMntService: DiscountsMntService,
        private readonly rabbitmqService: RabbitMQService,
    ) {}

    @MessagePattern(DiscountsMntMessagePattern.createDiscount)
    async createDiscount(@Ctx() context: RmqContext, { data }: { data: CreateDiscountRequestDTO }) {
        this.rabbitmqService.acknowledgeMessage(context);
        return await this.discountsMntService.createDiscount(data);
    }
}
