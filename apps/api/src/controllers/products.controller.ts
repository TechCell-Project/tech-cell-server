import { Controller, Inject, Get, Post, Body, Query, Param, Put, UseGuards } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { MANAGEMENTS_SERVICE, SEARCH_SERVICE } from '~/constants';
import { SuperAdminGuard, catchException } from '@app/common';
import {
    ApiBody,
    ApiNotFoundResponse,
    ApiOperation,
    ApiTags,
    ApiExtraModels,
    ApiOkResponse,
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiTooManyRequestsResponse,
    ApiExcludeEndpoint,
    ApiCreatedResponse,
} from '@nestjs/swagger';
import { ProductsMntMessagePattern } from '~/apps/managements/products-mnt';
import { ProductsSearchMessagePattern } from '~/apps/search/products-search';
import { GetProductsDTO } from '~/apps/search/products-search/dtos';
import { CreateProductRequestDTO } from '~/apps/managements/products-mnt/dtos';
import { ProductIdParamsDTO } from '~/apps/managements/products-mnt/dtos/params.dto';
import { UpdateProductRequestDTO } from '~/apps/managements/products-mnt/dtos/update-product-request.dto';
import { UpdateProductGeneralImagesDTO } from '~/apps/managements/products-mnt/dtos/update-product-general-images-request.dto';

@ApiBadRequestResponse({
    description: 'Invalid request',
})
@ApiTooManyRequestsResponse({
    description: 'Too many requests',
})
@ApiInternalServerErrorResponse({
    description: 'Internal server error',
})
@ApiTags('products')
@ApiExtraModels(CreateProductRequestDTO, UpdateProductRequestDTO, UpdateProductGeneralImagesDTO)
@Controller('products')
export class ProductsController {
    constructor(
        @Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ,
        @Inject(SEARCH_SERVICE) private readonly searchService: ClientRMQ,
    ) {}

    @ApiOperation({
        summary: 'Get products list',
    })
    @ApiOkResponse({ description: 'Get products successfully!' })
    @ApiNotFoundResponse({ description: 'Products not found.' })
    @Get('/')
    async getProducts(@Query() requestQuery: GetProductsDTO) {
        return this.searchService
            .send(ProductsSearchMessagePattern.getProducts, { ...requestQuery })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Create a new product',
    })
    @ApiBody({
        description: 'Create product request',
        type: CreateProductRequestDTO,
    })
    @ApiCreatedResponse({
        description: 'Create product successfully!',
    })
    @Post('/')
    async createProduct(@Body() { ...data }: CreateProductRequestDTO) {
        return this.managementsService
            .send(ProductsMntMessagePattern.createProduct, {
                ...data,
            })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Get product by id',
    })
    @ApiOkResponse({
        description: 'Get product information successfully!',
    })
    @Get('/:productId')
    async getProductById(@Param() { productId }: ProductIdParamsDTO) {
        return this.searchService
            .send(ProductsSearchMessagePattern.getProductById, { productId })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Update product by id',
    })
    @ApiOkResponse({
        description: 'Update product information',
    })
    @Put('/:productId')
    async updateProduct(
        @Param() { productId }: ProductIdParamsDTO,
        @Body() { ...productData }: UpdateProductRequestDTO,
    ) {
        return this.managementsService
            .send(ProductsMntMessagePattern.updateProductPutMethod, {
                productId,
                ...productData,
            })
            .pipe(catchException());
    }

    @ApiExcludeEndpoint(true)
    @UseGuards(SuperAdminGuard)
    @Post('/gen-clone')
    async gen(@Query() { num }: { num: number }) {
        return this.managementsService
            .send(ProductsMntMessagePattern.generateProducts, { num })
            .pipe(catchException());
    }
}
