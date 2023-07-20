import { RabbitMQService } from '@app/common';
import { Controller, Inject } from '@nestjs/common';
import { Ctx, MessagePattern, RmqContext, Payload } from '@nestjs/microservices';
import { ProductsSearchMessagePattern } from './products-search.pattern';
import { ProductsSearchService } from './products-search.service';
import { GetProductsDTO } from './dtos';

@Controller('products-search')
export class ProductsSearchController {
    constructor(
        @Inject(RabbitMQService) private readonly rabbitMqService: RabbitMQService,
        private readonly productsSearchService: ProductsSearchService,
    ) {}

    @MessagePattern(ProductsSearchMessagePattern.getProducts)
    async getUsers(@Ctx() context: RmqContext, @Payload() payload: GetProductsDTO) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.productsSearchService.getProducts({ ...payload });
    }
}
