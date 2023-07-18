import {
    Controller,
    Inject,
    Get,
    Post,
    UploadedFiles,
    UseInterceptors,
    Body,
    Patch,
    Param,
} from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { MANAGEMENTS_SERVICE } from '~/constants';
import { catchException } from '@app/common';
import { ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
// import { ProductsSearchMessagePattern } from '~/apps/search/products-search';
import { ProductsMntMessagePattern } from '~/apps/managements/products-mnt';
import { CreateProductRequestDto } from '~/apps/managements/products-mnt/dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
    constructor(@Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ) {}

    @Get('products')
    async getAllProducts() {
        return this.managementsService
            .send(ProductsMntMessagePattern.getAllProducts, {})
            .pipe(catchException());
    }

    @Post('product')
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
        return this.managementsService
            .send(
                { cmd: 'create_product' },
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
                    files,
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
