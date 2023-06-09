import { Controller, Inject, Body, Get, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PRODUCTS_SERVICE } from '../../../../constants';

@Controller('products')
export class ProductsController {
    constructor(@Inject(PRODUCTS_SERVICE) private readonly productsService: ClientProxy) {}

    @Get()
    async getProducts() {
        return this.productsService.send({ cmd: 'get_products' }, {});
    }

    @Post()
    async createProduct(@Body() productsData: { name: string; price: number; desc: string }) {
        return this.productsService.send(
            { cmd: 'create_product' },
            productsData ? productsData : undefined,
        );
    }
}
