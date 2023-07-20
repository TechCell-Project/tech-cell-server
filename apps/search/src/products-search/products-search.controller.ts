import { RabbitMQService } from '@app/common';
import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';
import { ProductsSearchMessagePattern } from './products-search.pattern';
import { ProductsSearchService } from './products-search.service';

@Controller('products-search')
export class ProductsSearchController {
    constructor(
        private readonly rabbitMqService: RabbitMQService,
        private readonly productsSearchService: ProductsSearchService,
    ) {}

    @MessagePattern(ProductsSearchMessagePattern.getProducts)
    async getProducts(@Ctx() context: RmqContext) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.productsSearchService.getProducts();
    }

    // @MessagePattern(ProductsSearchMessagePattern.getProductsByName)
    // async getProductsByName(@Ctx() context: RmqContext) {
    //     this.rabbitMqService.acknowledgeMessage(context);
    //     return this.productsSearchService.getProductsByName();
    // }
}
