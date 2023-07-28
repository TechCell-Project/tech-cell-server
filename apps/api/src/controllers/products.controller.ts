import {
    Controller,
    Inject,
    Get,
    Post,
    UploadedFiles,
    UseInterceptors,
    Body,
    Query,
} from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { MANAGEMENTS_SERVICE, SEARCH_SERVICE } from '~/constants';
import { catchException } from '@app/common';
import { ApiNotFoundResponse, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsMntMessagePattern } from '~/apps/managements/products-mnt';
import { ProductsSearchMessagePattern } from '~/apps/search/products-search';
import { GetProductsDTO } from '~/apps/search/products-search/dtos';
import { CreateProductRequestDTO } from '~/apps/managements/products-mnt/dtos';

@ApiTags('products')
@Controller('products')
export class ProductsController {
    constructor(
        @Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ,
        @Inject(SEARCH_SERVICE) private readonly searchService: ClientRMQ,
    ) {}

    // @ApiOkResponse({ description: 'Get products success', type: [ProductsMntResponseDto] })
    @ApiNotFoundResponse({ description: 'Products not found.' })
    @Get('/')
    async getProducts(@Query() requestQuery: GetProductsDTO) {
        return this.searchService
            .send(ProductsSearchMessagePattern.getProducts, { ...requestQuery })
            .pipe(catchException());
    }

    @Post('/')
    @UseInterceptors(FilesInterceptor('file[]', 5))
    async createProduct(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() { ...productData }: CreateProductRequestDTO,
    ) {
        return this.managementsService
            .send(ProductsMntMessagePattern.createProduct, {
                productData,
                files,
            })
            .pipe(catchException());
    }

    // @ApiCreatedResponse({ description: 'Create product success', type: ProductsMntResponseDto })
    // @Post('/')
    // @UseInterceptors(FilesInterceptor('file[]', 5))
    // async createProduct(
    //     @UploadedFiles() files: Express.Multer.File[],
    //     @Body()
    //     {
    //         name,
    //         attributes,
    //         manufacturer,
    //         categories,
    //         stock,
    //         filter,
    //         price,
    //         special_price,
    //         status,
    //     }: CreateProductRequestDto,
    // ) {
    //     return this.managementsService
    //         .send(ProductsMntMessagePattern.createProduct, {
    //             name,
    //             attributes,
    //             manufacturer,
    //             categories,
    //             stock,
    //             filter,
    //             price,
    //             special_price,
    //             status,
    //             files,
    //         })
    //         .pipe(catchException());
    // }

    // @ApiOkResponse({
    //     description: 'Product status change successful',
    //     type: ProductsMntResponseDto,
    // })
    // @ApiBadRequestResponse({
    //     description: 'Invalid request',
    // })
    // @Patch('/:id/change-status')
    // async changeStatus(@Param('id') idParam: string, @Body() { status }: ChangeStatusRequestDTO) {
    //     return this.managementsService
    //         .send(ProductsMntMessagePattern.changeStatus, { productId: idParam, status })
    //         .pipe(catchException());
    // }
}
