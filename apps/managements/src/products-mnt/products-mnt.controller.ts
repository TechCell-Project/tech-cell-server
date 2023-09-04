import { Controller, Get, Inject } from '@nestjs/common';
import { MessagePattern, RmqContext, Payload, Ctx } from '@nestjs/microservices';
import { RabbitMQService } from '@app/common';
import { ProductsMntService } from './products-mnt.service';
import { ProductsMntMessagePattern } from './products-mnt.pattern';
import { UpdateProductRequestDTO } from './dtos/update-product-request.dto';
import { ProductIdParamsDTO } from './dtos/params.dto';

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
        {
            productData,
            files,
        }: {
            productData: string; //CreateProductRequestDTO;
            files: Express.Multer.File[];
        },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.productsMntService.createProduct({ productData, files });
    }

    @MessagePattern(ProductsMntMessagePattern.updateProductGeneral)
    async updateProductGeneral(
        @Ctx() context: RmqContext,
        @Payload()
        { productId, ...payload }: UpdateProductRequestDTO & ProductIdParamsDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.productsMntService.updateProductGeneral({
            productId,
            ...payload,
        });
    }

    @MessagePattern(ProductsMntMessagePattern.generateProducts)
    async gen(@Ctx() context: RmqContext, @Payload() { num }: { num: number }) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.productsMntService.gen(num);
    }
}
