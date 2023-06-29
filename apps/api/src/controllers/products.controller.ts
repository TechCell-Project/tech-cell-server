import { Controller, Inject, Body, Get, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PRODUCTS_SERVICE } from '~/constants';
import { AuthGuard, catchException } from '@app/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController {
    constructor(@Inject(PRODUCTS_SERVICE) private readonly productsService: ClientProxy) {}

    @Get()
    async getProducts() {
        return this.productsService.send({ cmd: 'get_products' }, {}).pipe(catchException());
    }

    @UseGuards(AuthGuard)
    @Post()
    async createProduct(@Body() productsData: { name: string; price: number; desc: string }) {
        return this.productsService
            .send({ cmd: 'create_product' }, productsData ? productsData : undefined)
            .pipe(catchException());
    }
}
