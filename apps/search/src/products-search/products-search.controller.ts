import { RabbitMQService } from '~libs/common/RabbitMQ';
import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, RmqContext, Payload } from '@nestjs/microservices';
import { ProductsSearchMessagePattern } from './products-search.pattern';
import { ProductsSearchService } from './products-search.service';
import { GetProductByIdQueryDTO, GetProductsDTO } from './dtos';
import { ProductIdParamsDTO } from '~apps/managements/products-mnt/dtos/params.dto';

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
        @Payload() { productId, ...query }: ProductIdParamsDTO & GetProductByIdQueryDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.productsSearchService.getProductById({ id: productId, ...query });
    }
}
