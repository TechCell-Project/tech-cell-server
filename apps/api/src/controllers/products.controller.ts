import { Controller, Inject, Body, Get, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PRODUCTS_SERVICE } from '../../../../constants';
import { AuthGuard } from '@app/common';

@Controller('products')
export class ProductsController {
    constructor(@Inject(PRODUCTS_SERVICE) private readonly productsService: ClientProxy) {}

    @Get()
    async getProducts() {
        return this.productsService.send({ cmd: 'get_products' }, {});
    }

    @UseGuards(AuthGuard)
    @Post()
    async createProduct(@Body() productsData: { name: string; price: number; desc: string }) {
        return this.productsService.send(
            { cmd: 'create_product' },
            productsData ? productsData : undefined,
        );
    }
}
