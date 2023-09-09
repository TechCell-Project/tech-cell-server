import { Controller, Get, Inject } from '@nestjs/common';
import { MessagePattern, RmqContext, Payload, Ctx } from '@nestjs/microservices';
import { RabbitMQService } from '@app/common';
import { ProductsMntService } from './products-mnt.service';
import { ProductsMntMessagePattern } from './products-mnt.pattern';
import { ProductIdParamsDTO } from './dtos/params.dto';
import { ProductDataDTO } from './dtos/productData.dto';
import { UpdateProductRequestDTO } from './dtos/update-product-request.dto';
import { UpdateProductGeneralImagesDTO } from './dtos/update-product-general-images-request.dto';
import { CreateProductRequestDTO } from './dtos';

@Controller()
export class ProductsMntController {
    constructor(
        @Inject(RabbitMQService) private readonly rabbitMqService: RabbitMQService,
        private readonly productsMntService: ProductsMntService,
    ) {}

    @Get('ping')
    getHello() {
        return { message: 'pong' };
    }

    @MessagePattern(ProductsMntMessagePattern.createProduct)
    async createProduct(
        @Ctx() context: RmqContext,
        @Payload()
        { ...data }: CreateProductRequestDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.productsMntService.createProduct({ ...data });
    }

    @MessagePattern(ProductsMntMessagePattern.generateProducts)
    async gen(@Ctx() context: RmqContext, @Payload() { num }: { num: number }) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.productsMntService.gen(num);
    }

    @MessagePattern(ProductsMntMessagePattern.updateProductGeneral)
    async updateProductGeneral(
        @Ctx() context: RmqContext,
        @Payload()
        { ...payload }: ProductIdParamsDTO & UpdateProductRequestDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.productsMntService.updateProductGeneral({ ...payload });
    }

    @MessagePattern(ProductsMntMessagePattern.updateProductGeneralImages)
    async updateProductGeneralImages(
        @Ctx() context: RmqContext,
        @Payload()
        {
            productId,
            images,
            files,
        }: ProductIdParamsDTO &
            UpdateProductGeneralImagesDTO & {
                files: Express.Multer.File[];
            },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.productsMntService.updateProductGeneralImages({
            productId,
            images,
            files,
        });
    }
}
