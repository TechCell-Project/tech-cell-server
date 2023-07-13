import {
    Controller,
    Inject,
    Body,
    Get,
    Post,
    UseGuards,
    UploadedFile,
    UseInterceptors,
    Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PRODUCTS_SERVICE } from '~/constants';
import { AuthGuard, catchException } from '@app/common';
import {
    ApiTags,
    ApiOkResponse,
    ApiNotFoundResponse,
    ApiBadRequestResponse,
} from '@nestjs/swagger';
// import { uploadCloud } from './../configs';
import { SearchProductsRequestDTO, SearchProductResponseDTO } from '~/apps/products/dtos';

@ApiTags('products')
@Controller('products')
export class ProductsController {
    constructor(@Inject(PRODUCTS_SERVICE) private readonly productsService: ClientProxy) {}

    @Get()
    async getProducts() {
        return this.productsService.send({ cmd: 'get_products' }, {}).pipe(catchException());
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

    @ApiOkResponse({ description: 'Products found', type: SearchProductResponseDTO, isArray: true })
    @ApiNotFoundResponse({ description: 'No products found' })
    @ApiBadRequestResponse({ description: 'Invalid request parameters' })
    @Get('search')
    async searchProducts(
        @Query() { searchTerm, page, sortField, sortOrder }: SearchProductsRequestDTO,
    ) {
        return this.productsService
            .send({ cmd: 'search_product_by_name' }, { searchTerm, page, sortField, sortOrder })
            .pipe(catchException());
    }
}
