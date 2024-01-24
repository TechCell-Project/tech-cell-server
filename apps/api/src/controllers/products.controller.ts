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
    Headers,
} from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { MANAGEMENTS_SERVICE, SEARCH_SERVICE } from '~libs/common/constants';
import { ModGuard, SuperAdminGuard } from '~libs/common';
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
import {
    CreateProductRequestDTO,
    UpdateProductRequestDTO,
    ProductIdParamsDTO,
    ProductSkuQueryDTO,
} from '~apps/managements/products-mnt/dtos';
import { ProductDTO } from '~libs/resource/products/dtos/product.dto';
import { sendMessagePipeException } from '~libs/common/RabbitMQ/rmq.util';
import { THeaders } from '~libs/common/types/common.type';

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
    async getProducts(@Headers() headers: THeaders, @Query() requestQuery: GetProductsDTO) {
        return sendMessagePipeException<GetProductsDTO>({
            client: this.searchService,
            pattern: ProductsSearchMessagePattern.getProducts,
            data: { ...requestQuery },
            headers,
        });
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
    async createProduct(
        @Headers() headers: THeaders,
        @Body() { ...data }: CreateProductRequestDTO,
    ) {
        return sendMessagePipeException<CreateProductRequestDTO>({
            client: this.managementsService,
            pattern: ProductsMntMessagePattern.createProduct,
            data: { ...data },
            headers,
        });
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
        @Headers() headers: THeaders,
        @Param() { productId }: ProductIdParamsDTO,
        @Query() { ...query }: GetProductByIdQueryDTO,
    ) {
        return sendMessagePipeException({
            client: this.searchService,
            pattern: ProductsSearchMessagePattern.getProductById,
            data: { productId, ...query },
            headers,
        });
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
        @Headers() headers: THeaders,
        @Param() { productId }: ProductIdParamsDTO,
        @Body() { ...productData }: UpdateProductRequestDTO,
    ) {
        return sendMessagePipeException({
            client: this.managementsService,
            pattern: ProductsMntMessagePattern.updateProductPutMethod,
            data: { productId, ...productData },
            headers,
        });
    }

    @ApiExcludeEndpoint(true)
    @UseGuards(SuperAdminGuard)
    @Post('/gen-clone')
    async gen(@Headers() headers: THeaders, @Query() { num }: { num: number }) {
        return sendMessagePipeException({
            client: this.managementsService,
            pattern: ProductsMntMessagePattern.generateProducts,
            data: { num },
            headers,
        });
    }

    @ApiOperation({
        summary: 'Delete product by id',
    })
    @ApiOkResponse({
        description: 'Delete product successfully!',
    })
    @Delete('/:productId')
    @UseGuards(ModGuard)
    async deleteProduct(@Headers() headers: THeaders, @Param() { productId }: ProductIdParamsDTO) {
        return sendMessagePipeException({
            client: this.managementsService,
            pattern: ProductsMntMessagePattern.deleteProduct,
            data: { productId },
            headers,
        });
    }

    @ApiOperation({
        summary: 'Delete product variation',
    })
    @ApiOkResponse({
        description: 'Delete product variation successfully!',
    })
    @Delete('/:productId')
    @UseGuards(ModGuard)
    async deleteProductVariation(
        @Headers() headers: THeaders,
        @Param() { productId }: ProductIdParamsDTO,
        @Query() { sku }: ProductSkuQueryDTO,
    ) {
        return sendMessagePipeException({
            client: this.managementsService,
            pattern: ProductsMntMessagePattern.deleteProductVariation,
            data: { productId, sku },
            headers,
        });
    }
}
