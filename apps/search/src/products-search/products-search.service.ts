import { Injectable } from '@nestjs/common';
import { ProductsService } from '@app/resource/products';

@Injectable()
export class ProductsSearchService {
    constructor(private readonly productsService: ProductsService) {}

    async getProducts() {
        return this.productsService.getAllProducts();
    }

    // async getProductsByName() {
    //     return this.productsService.searchByName({});
    // }
}
