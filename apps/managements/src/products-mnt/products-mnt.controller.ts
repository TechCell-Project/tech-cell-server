import { Controller, Get, Inject } from '@nestjs/common';
import { MessagePattern, RmqContext, Payload, Ctx } from '@nestjs/microservices';
import { RabbitMQService } from '@app/common';
import { ProductsMntService } from './products-mnt.service';
import { ProductsMntMessagePattern } from './products-mnt.pattern';
import { CreateProductRequestDto } from './dtos';
import { CloudinaryService } from '@app/common/Cloudinary';

@Controller()
export class ProductsMntController {
    constructor(
        @Inject(RabbitMQService) private readonly rabbitMqService: RabbitMQService,
        private readonly productsMntService: ProductsMntService,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    @Get('ping')
    getHello() {
        return { message: 'pong' };
    }

    @MessagePattern(ProductsMntMessagePattern.createProduct)
    async createProduct(@Ctx() context: RmqContext, @Payload() payload: CreateProductRequestDto) {
        this.rabbitMqService.acknowledgeMessage(context);
        let thumbnail;
        const images = [];

        for (const file of payload.files) {
            const { fieldname, filename } = file;
            const dateModified = new Date();

            const uploadedImage = await this.cloudinaryService.uploadFile(file);
            const imageObject = {
                file_name: filename,
                path: uploadedImage.secure_url,
                cloudinary_id: uploadedImage.public_id,
                date_modified: dateModified,
            };

            if (fieldname == 'thumbnail') {
                thumbnail = imageObject;
            } else {
                images.push(imageObject);
            }
        }
        delete payload.files;
        payload.images = images;
        payload.thumbnail = thumbnail;
        return await this.productsMntService.createProduct({ ...payload });
    }

    @MessagePattern(ProductsMntMessagePattern.changeStatus)
    async changeStatus(@Ctx() context: RmqContext, @Payload() payload) {
        this.rabbitMqService.acknowledgeMessage(context);

        const { productId, status } = payload;

        return await this.productsMntService.changeStatus({
            productId,
            status,
        });
    }

    @MessagePattern(ProductsMntMessagePattern.updateProduct)
    async updateProduct(@Ctx() context: RmqContext, @Payload() payload) {
        this.rabbitMqService.acknowledgeMessage(context);

        const { productId, status } = payload;

        return await this.productsMntService.changeStatus({
            productId,
            status,
        });
    }
}
