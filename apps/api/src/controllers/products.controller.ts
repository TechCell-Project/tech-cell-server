import {
    Controller,
    Inject,
    Get,
    Post,
    UploadedFiles,
    UseInterceptors,
    Body,
    Query,
    BadRequestException,
    Param,
    Patch,
    Put,
    UseGuards,
} from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { MANAGEMENTS_SERVICE, ProductImageFieldname, SEARCH_SERVICE } from '~/constants';
import { SuperAdminGuard, catchException } from '@app/common';
import {
    ApiBody,
    ApiConsumes,
    ApiNotFoundResponse,
    ApiOperation,
    ApiTags,
    ApiExtraModels,
    getSchemaPath,
    ApiOkResponse,
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiTooManyRequestsResponse,
    ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ProductsMntMessagePattern } from '~/apps/managements/products-mnt';
import { ProductsSearchMessagePattern } from '~/apps/search/products-search';
import { GetProductsDTO } from '~/apps/search/products-search/dtos';
import { CreateProductRequestDTO } from '~/apps/managements/products-mnt/dtos';
import { ProductIdParamsDTO } from '~/apps/managements/products-mnt/dtos/params.dto';
import { UpdateProductRequestDTO } from '~/apps/managements/products-mnt/dtos/update-product-request.dto';
import { ProductDataDTO } from '~/apps/managements/products-mnt/dtos/productData.dto';
import { UpdateProductGeneralImagesDTO } from '~/apps/managements/products-mnt/dtos/update-product-general-images-request.dto';
import { FilesDTO } from '~/apps/managements/products-mnt/dtos/files.dto';

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
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description:
            'Create product request.\n\n' +
            'Product data rules:\n' +
            `- Follow the ${getSchemaPath(CreateProductRequestDTO.name)}\n\n` +
            'File rules:\n' +
            '- Only image files are allowed.\n' +
            '- Maximum 30 files.\n' +
            '- Maximum 10 MB per file.\n' +
            '- Allowed file extensions: jpg, jpeg, png, gif, webp.\n' +
            '- Allowed file mime types: image/jpeg, image/png, image/gif, image/webp.\n\n' +
            '- `FieldName` of file must follow above rule:\n' +
            `   - Each name should be separated by \`underscore(_)\`\n` +
            `   - Start with \`${ProductImageFieldname.GENERAL}\` or \`${ProductImageFieldname.VARIATION}\`.\n` +
            `   - If start with \`${ProductImageFieldname.VARIATION}\`, must end with a number to define variation index.\n` +
            `   - The next field name could be \`${ProductImageFieldname.IS_THUMBNAIL}\` to define thumbnail image.\n` +
            `   - Example: \`${ProductImageFieldname.GENERAL}\`, \`${ProductImageFieldname.VARIATION}_1\`, \`${ProductImageFieldname.VARIATION}_${ProductImageFieldname.IS_THUMBNAIL}_2\`.\n\n`,
        required: true,
        schema: {
            type: 'object',
            properties: {
                productData: {
                    type: 'object',
                    description: 'Product data',
                    $ref: getSchemaPath(CreateProductRequestDTO.name),
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
            fileFilter: (req, file, cb) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                    return cb(new BadRequestException('Only image files are allowed!'), false);
                }
                cb(null, true);
            },
        }),
    )
    async createProduct(
        @Body() { productData }: ProductDataDTO,
        @UploadedFiles() files: Array<Express.Multer.File>,
    ) {
        return this.managementsService
            .send(ProductsMntMessagePattern.createProduct, {
                productData,
                files,
            })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Get product by id',
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
    @ApiBadRequestResponse({
        description: 'Invalid request',
    })
    @Put('/:productId')
    async updateProduct(
        @Param() { productId }: ProductIdParamsDTO,
        @Body() { ...productData }: UpdateProductRequestDTO,
    ) {
        return this.managementsService
            .send(ProductsMntMessagePattern.updateProductGeneral, {
                productId,
                ...productData,
            })
            .pipe(catchException());
    }

    @ApiExcludeEndpoint(true)
    @ApiOkResponse({
        description: 'Update product data, can add new variations, images ...',
    })
    @Patch('/:productId/:sku')
    async updateProductVariations(
        @Param('productId') productId: string,
        @Param('sku') sku: string,
        @Body() { ...payload }: any,
    ) {
        return { productId, sku, payload };
    }

    @ApiExcludeEndpoint(true)
    @UseGuards(SuperAdminGuard)
    @Post('/gen-clone')
    async gen(@Query() { num }: { num: number }) {
        return this.managementsService
            .send(ProductsMntMessagePattern.generateProducts, { num })
            .pipe(catchException());
    }

    @ApiExcludeEndpoint(true)
    @Post('/:productId/images')
    async updateProductGeneralImages(
        @Param() { productId }: ProductIdParamsDTO,
        @Body() { images }: UpdateProductGeneralImagesDTO,
        @UploadedFiles()
        { files }: FilesDTO,
    ) {
        return this.managementsService
            .send(ProductsMntMessagePattern.updateProductGeneralImages, {
                productId,
                images,
                files,
            })
            .pipe(catchException());
    }
}
