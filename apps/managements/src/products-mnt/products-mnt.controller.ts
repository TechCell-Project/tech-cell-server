import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, RmqContext, Payload, Ctx } from '@nestjs/microservices';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { ProductsMntService } from './products-mnt.service';
import { ProductsMntMessagePattern } from './products-mnt.pattern';
import { ProductIdParamsDTO, ProductSkuParamsDTO } from './dtos/params.dto';
import { UpdateProductRequestDTO } from './dtos/update-product-request.dto';
import { CreateProductRequestDTO } from './dtos';

@Controller()
export class ProductsMntController {
    constructor(
        @Inject(RabbitMQService) private readonly rabbitMqService: RabbitMQService,
        private readonly productsMntService: ProductsMntService,
    ) {}

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

    @MessagePattern(ProductsMntMessagePattern.updateProductPutMethod)
    async updateProductPutMethod(
        @Ctx() context: RmqContext,
        @Payload()
        { ...payload }: ProductIdParamsDTO & UpdateProductRequestDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.productsMntService.updateProductPutMethod({ ...payload });
    }

    @MessagePattern(ProductsMntMessagePattern.deleteProduct)
    async deleteProduct(@Ctx() context: RmqContext, @Payload() { productId }: ProductIdParamsDTO) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.productsMntService.deleteProduct({ productId });
    }

    @MessagePattern(ProductsMntMessagePattern.deleteProductVariation)
    async deleteProductVariation(
        @Ctx() context: RmqContext,
        @Payload() { productId, sku }: ProductIdParamsDTO & ProductSkuParamsDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.productsMntService.deleteProductVariation({ productId, sku });
    }
}
