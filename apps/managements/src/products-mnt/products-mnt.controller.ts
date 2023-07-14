import { Controller, Get, Inject } from '@nestjs/common';
import { MessagePattern, RmqContext, Payload, Ctx } from '@nestjs/microservices';
import { RabbitMQService } from '@app/common';
import { ProductsMntService } from './products-mnt.service';
import { ProductsMntMessagePattern } from './products-mnt.pattern';

@Controller()
export class ProductsMntController {
    constructor(
        @Inject(RabbitMQService) private readonly rabbitMqService: RabbitMQService,
        private readonly productsMntService: ProductsMntService,
    ) {}

    @Get('ping')
    getHello() {
        return { message: 'pong' };
    }
}
