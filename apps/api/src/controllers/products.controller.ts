import {
    Controller,
    Inject,
    Get,
    Post,
    UploadedFiles,
    UseInterceptors,
    Body,
    UploadedFile,
    Patch,
    Param,
} from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { SEARCH_SERVICE } from '~/constants';
import { catchException } from '@app/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
// import { ProductsSearchMessagePattern } from '~/apps/search/products-search';
import { ProductsMntMessagePattern } from '~/apps/managements/products-mnt';
import { CloudinaryService } from '@app/common/Cloudinary';
import { CreateProductRequestDto } from '~/apps/managements/products-mnt/dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
    constructor(
        @Inject(SEARCH_SERVICE) private readonly managementsService: ClientRMQ,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    @Get('getAllproducts')
    async getAllProducts() {
        return this.managementsService
            .send(ProductsMntMessagePattern.getAllProducts, {})
            .pipe(catchException());
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadImage(@UploadedFile() file: Express.Multer.File) {
        return this.cloudinaryService.uploadFile(file);
    }

    @Post('create-product')
    @UseInterceptors(FilesInterceptor('file[]', 5))
    async createProduct(
        @UploadedFiles() files: Express.Multer.File[],
        @Body()
        {
            name,
            attributes,
            manufacturer,
            categories,
            stock,
            filter,
            price,
            special_price,
            status,
        }: CreateProductRequestDto,
    ) {
        let thumbnail: object;
        const images = [];

        for (const file of files) {
            const { fieldname, filename } = file;
            const dateModified = new Date();

            const uploadedImage = await this.cloudinaryService.uploadFile(file);

            const imageObject = {
                name: filename,
                path: uploadedImage.url,
                date_modified: dateModified,
            };

            if (fieldname == 'thumbnail') {
                thumbnail = imageObject;
            } else {
                images.push(imageObject);
            }
        }
        return this.managementsService
            .send(
                { cmd: 'create_product' },
                {
                    name,
                    attributes,
                    manufacturer,
                    images,
                    categories,
                    stock,
                    filter,
                    price,
                    special_price,
                    thumbnail,
                    status,
                },
            )
            .pipe(catchException());
    }

    @Patch('products/:id/change-status')
    async changeStatus(@Param('id') idParam: string, @Body() { status }: { status: number }) {
        return this.managementsService
            .send(ProductsMntMessagePattern.changeStatus, { productId: idParam, status })
            .pipe(catchException());
    }
}
