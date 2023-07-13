import { Controller, Inject, Get } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { SEARCH_SERVICE } from '~/constants';
import { catchException } from '@app/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductsSearchMessagePattern } from '~/apps/search/products-search';

@ApiTags('products')
@Controller('products')
export class ProductsController {
    constructor(@Inject(SEARCH_SERVICE) private readonly searchService: ClientRMQ) {}

    @Get()
    async getProducts() {
        return this.searchService
            .send(ProductsSearchMessagePattern.getProducts, {})
            .pipe(catchException());
    }

    // @UseGuards(AuthGuard)
    // @Post()
    // @UseInterceptors(uploadCloud.single('file'), uploadCloud.multiple('files'))
    // async createProduct(
    //     @UploadedFile() file: Express.Multer.File,
    //     @Body()
    //     {
    //         name,
    //         attributes,
    //         manufacturer,
    //         categories,
    //         status,
    //         stock,
    //         filter,
    //         price,
    //         special_price,
    //     }: createProductRequestDto,
    // ) {
    //     return this.productsService
    //         .send(
    //             { cmd: 'create_product' },
    //             {
    //                 name,
    //                 attributes,
    //                 manufacturer,
    //                 categories,
    //                 status,
    //                 stock,
    //                 filter,
    //                 price,
    //                 special_price,
    //                 file,
    //             },
    //         )
    //         .pipe(catchException());
    // }

    // @ApiOkResponse({ description: 'Products found', type: SearchProductResponseDTO, isArray: true })
    // @ApiNotFoundResponse({ description: 'No products found' })
    // @ApiBadRequestResponse({ description: 'Invalid request parameters' })
    // @Get('search')
    // async searchProducts(
    //     @Query() { searchTerm, page, sortField, sortOrder }: SearchProductsRequestDTO,
    // ) {
    //     return this.productsService
    //         .send({ cmd: 'search_product_by_name' }, { searchTerm, page, sortField, sortOrder })
    //         .pipe(catchException());
    // }
}
