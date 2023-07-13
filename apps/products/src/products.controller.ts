import { Controller, Get, Inject } from '@nestjs/common';
import { ProductsService } from './products.service';
import { RabbitMQService } from '@app/common';
import { MessagePattern, Ctx, RmqContext, Payload } from '@nestjs/microservices';
import { CreateProductRequestDto, UpdateProductRequestDto, SearchProductsRequestDTO } from '~/apps/products/dtos';

@Controller()
export class ProductsController {
    constructor(
        @Inject(RabbitMQService) private readonly rabbitMqService: RabbitMQService,
        private readonly productsService: ProductsService,
    ) {}

    @MessagePattern({ cmd: 'search_product_by_name' })
    async getProduct(
        @Ctx() context: RmqContext,
        @Payload() { searchTerm, page, sortField, sortOrder }: SearchProductsRequestDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        const products = await this.productsService.searchByName({
            searchTerm,
            page,
            sortField,
            sortOrder,
        });
        return {
            products: products,
        };
    }

    // @MessagePattern({ cmd: 'create_product' })
    // async createProduct(@Payload() product: createProductDto, @Ctx() context: RmqContext) {
    //     this.rabbitMqService.acknowledgeMessage(context);
    //     return await this.productsService.create(product);
    // }

    // @MessagePattern({ cmd: 'update_product' })
    // async editProduct(@Payload() product: updateProductDto, @Ctx() context: RmqContext) {
    //     this.rabbitMqService.acknowledgeMessage(context);
    //     return await this.productsService.create(product);
    // }
}
