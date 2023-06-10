import { Controller, Get, Inject, UseFilters } from '@nestjs/common';
import { ProductsService } from './services';
import { RabbitMQService } from '@app/common';
import { MessagePattern, Ctx, RmqContext, Payload } from '@nestjs/microservices';
import { CreateProductRequest } from './dtos';
import { ValidationPipe } from '@app/common';
import { RpcValidationFilter } from '@app/common';

@Controller()
export class ProductsController {
    constructor(
        @Inject(RabbitMQService) private readonly rabbitMqService: RabbitMQService,
        private readonly productsService: ProductsService,
    ) {}

    @Get('ping')
    async getPing() {
        return this.productsService.getPing();
    }

    @MessagePattern({ cmd: 'get_products' })
    async getProducts(@Ctx() context: RmqContext) {
        this.rabbitMqService.acknowledgeMessage(context);
        const products = await this.productsService.findAll();
        return {
            products: products,
        };
    }

    @UseFilters(new RpcValidationFilter())
    @MessagePattern({ cmd: 'create_product' })
    async createProduct(
        @Payload(new ValidationPipe()) product: CreateProductRequest,
        @Ctx() context: RmqContext,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        const createdProduct = await this.productsService.create(product);
        return createdProduct;
    }
}
