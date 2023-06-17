import { Controller, Inject, Body, Get, Post, UseGuards } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PRODUCTS_SERVICE } from '~/constants';
import { AuthGuard } from '@app/common';
import { catchError, throwError } from 'rxjs';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController {
    constructor(@Inject(PRODUCTS_SERVICE) private readonly productsService: ClientProxy) {}

    @Get()
    async getProducts() {
        return this.productsService
            .send({ cmd: 'get_products' }, {})
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
    }

    @UseGuards(AuthGuard)
    @Post()
    async createProduct(@Body() productsData: { name: string; price: number; desc: string }) {
        return this.productsService
            .send({ cmd: 'create_product' }, productsData ? productsData : undefined)
            .pipe(catchError((error) => throwError(() => new RpcException(error.response))));
    }
}
