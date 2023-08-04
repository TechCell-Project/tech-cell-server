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
} from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { MANAGEMENTS_SERVICE, ProductImageFieldname, SEARCH_SERVICE } from '~/constants';
import { catchException } from '@app/common';
import {
    ApiBody,
    ApiConsumes,
    ApiNotFoundResponse,
    ApiOperation,
    ApiTags,
    ApiExtraModels,
    getSchemaPath,
    ApiOkResponse,
} from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ProductsMntMessagePattern } from '~/apps/managements/products-mnt';
import { ProductsSearchMessagePattern } from '~/apps/search/products-search';
import { GetProductsDTO } from '~/apps/search/products-search/dtos';
import { CreateProductRequestDTO } from '~/apps/managements/products-mnt/dtos';

@ApiTags('products')
@ApiExtraModels(CreateProductRequestDTO)
@Controller('products')
export class ProductsController {
    constructor(
        @Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ,
        @Inject(SEARCH_SERVICE) private readonly searchService: ClientRMQ,
    ) {}

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
