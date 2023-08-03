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
import { ApiBody, ApiConsumes, ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnyFilesInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ProductsMntMessagePattern } from '~/apps/managements/products-mnt';
import { ProductsSearchMessagePattern } from '~/apps/search/products-search';
import { GetProductsDTO } from '~/apps/search/products-search/dtos';
import { CreateProductRequestDTO } from '~/apps/managements/products-mnt/dtos';
import { ApiMultiFile } from '@app/common/decorators';

@ApiTags('products')
@Controller('products')
export class ProductsController {
    constructor(
        @Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ,
        @Inject(SEARCH_SERVICE) private readonly searchService: ClientRMQ,
    ) {}

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
    @ApiConsumes('multipart/form-data')
    // @ApiMultiFile('files')
    @ApiBody({
        description: 'Create product request',
        examples: {},
        required: true,
        schema: {
            type: 'object',
            properties: {
                productData: {
                    type: 'string',
                    description: 'Product data',
                },
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        },
    })
    @Post('/')
    @UseInterceptors(
        AnyFilesInterceptor({
            limits: {
                files: 30,
                fileSize: 10 * 1024 * 1024, // 10 MB
            },
        }),
    )
    async createProduct(
        @Body('productData') productData: string,
        @UploadedFiles() files: Array<Express.Multer.File>,
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
