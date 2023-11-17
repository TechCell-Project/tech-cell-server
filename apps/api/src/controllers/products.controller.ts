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
import { MANAGEMENTS_SERVICE, SEARCH_SERVICE } from '~libs/common/constants';
import { ModGuard, SuperAdminGuard, catchException } from '~libs/common';
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
import { ProductsMntMessagePattern } from '~apps/managements/products-mnt';
import { ProductsSearchMessagePattern } from '~apps/search/products-search';
import {
    GetProductByIdQueryDTO,
    GetProductsDTO,
    ListProductResponseDTO,
} from '~apps/search/products-search/dtos';
import { CreateProductRequestDTO } from '~apps/managements/products-mnt/dtos';
import {
    ProductIdParamsDTO,
    ProductSkuParamsDTO,
} from '~apps/managements/products-mnt/dtos/params.dto';
import { UpdateProductRequestDTO } from '~apps/managements/products-mnt/dtos/update-product-request.dto';
import { ProductDTO } from '~libs/resource/products/dtos/product.dto';

@ApiBadRequestResponse({
    description: 'Invalid request, please check your request data!',
})
@ApiNotFoundResponse({
    description: 'Not found data, please try again!',
})
@ApiTooManyRequestsResponse({
    description: 'Too many requests, please try again later!',
})
@ApiInternalServerErrorResponse({
    description: 'Internal server error, please try again later!',
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
    @ApiOkResponse({ description: 'Get products successfully!', type: ListProductResponseDTO })
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
        type: ProductDTO,
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
