import { RabbitMQService } from '@app/common';
import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, RmqContext, Payload } from '@nestjs/microservices';
import { ProductsSearchMessagePattern } from './products-search.pattern';
import { ProductsSearchService } from './products-search.service';
import { GetProductsDTO } from './dtos';
import { Types } from 'mongoose';

@Controller('products-search')
export class ProductsSearchController {
    constructor(
        private readonly rabbitMqService: RabbitMQService,
        private readonly productsSearchService: ProductsSearchService,
    ) {}

    @MessagePattern(ProductsSearchMessagePattern.getProducts)
    async getProducts(@Ctx() context: RmqContext, @Payload() payload: GetProductsDTO) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.productsSearchService.getProducts({ ...payload });
    }

    @MessagePattern(ProductsSearchMessagePattern.getProductById)
    async getProductById(
        @Ctx() context: RmqContext,
        @Payload() { productId }: { productId: Types.ObjectId },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.productsSearchService.getProductById(productId);
    }
}
