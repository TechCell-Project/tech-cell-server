import {
    Controller,
    Inject,
    Get,
    Post,
    Body,
    Query,
    Param,
    Put,
    UseGuards,
    Delete,
} from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { MANAGEMENTS_SERVICE, SEARCH_SERVICE } from '~/constants';
import { ModGuard, SuperAdminGuard, catchException } from '@app/common';
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
import { GetProductByIdQueryDTO, GetProductsDTO } from '~/apps/search/products-search/dtos';
import { CreateProductRequestDTO } from '~/apps/managements/products-mnt/dtos';
import {
    ProductIdParamsDTO,
    ProductSkuParamsDTO,
} from '~/apps/managements/products-mnt/dtos/params.dto';
import { UpdateProductRequestDTO } from '~/apps/managements/products-mnt/dtos/update-product-request.dto';

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
@ApiExtraModels(CreateProductRequestDTO, UpdateProductRequestDTO)
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
    @UseGuards(ModGuard)
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
    async getProductById(
        @Param() { productId }: ProductIdParamsDTO,
        @Query() { ...query }: GetProductByIdQueryDTO,
    ) {
        return this.searchService
            .send(ProductsSearchMessagePattern.getProductById, { productId, ...query })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Update product by id',
    })
    @ApiOkResponse({
        description: 'Update product information',
    })
    @Put('/:productId')
    @UseGuards(ModGuard)
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

    @ApiOperation({
        summary: 'Delete product by id',
    })
    @ApiOkResponse({
        description: 'Delete product successfully!',
    })
    @Delete('/:productId')
    @UseGuards(ModGuard)
    async deleteProduct(@Param() { productId }: ProductIdParamsDTO) {
        return this.managementsService
            .send(ProductsMntMessagePattern.deleteProduct, { productId })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Delete product variation',
    })
    @ApiOkResponse({
        description: 'Delete product variation successfully!',
    })
    @Delete('/:productId/:sku')
    @UseGuards(ModGuard)
    async deleteProductVariation(
        @Param() { productId }: ProductIdParamsDTO,
        @Param() { sku }: ProductSkuParamsDTO,
    ) {
        return this.managementsService
            .send(ProductsMntMessagePattern.deleteProductVariation, { productId, sku })
            .pipe(catchException());
    }
}
