import { Controller, Get, Inject } from '@nestjs/common';
import { MessagePattern, RmqContext, Payload, Ctx } from '@nestjs/microservices';
import { RabbitMQService } from '@app/common';
import { ProductsMntService } from './products-mnt.service';
import { ProductsMntMessagePattern } from './products-mnt.pattern';
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
        // return { productData, files: files.map((file) => file.fieldname) };
    }

    // @MessagePattern(ProductsMntMessagePattern.changeStatus)
    // async changeStatus(@Ctx() context: RmqContext, @Payload() payload) {
    //     this.rabbitMqService.acknowledgeMessage(context);

    //     const { productId, status } = payload;

    //     return await this.productsMntService.changeStatus({
    //         productId,
    //         status,
    //     });
    // }

    // @MessagePattern(ProductsMntMessagePattern.updateProduct)
    // async updateProduct(@Ctx() context: RmqContext, @Payload() payload) {
    //     this.rabbitMqService.acknowledgeMessage(context);

    //     const { productId, status } = payload;

    //     return await this.productsMntService.changeStatus({
    //         productId,
    //         status,
    //     });
    // }
}
