import { RabbitMQService } from '~libs/common/RabbitMQ';
import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { ImagesMntMessagePattern } from './images-mnt.pattern';
import { ImagesMntService } from './images-mnt.service';
import { PublicIdDTO } from './dtos/publicId.dto';

@Controller()
export class ImagesMntController {
    constructor(
        private readonly imagesMntService: ImagesMntService,
        private readonly rabbitmqService: RabbitMQService,
    ) {}

    @MessagePattern(ImagesMntMessagePattern.getImages)
    async getImages(@Ctx() context: RmqContext) {
        this.rabbitmqService.acknowledgeMessage(context);
        return this.imagesMntService.getImages();
    }

    @MessagePattern(ImagesMntMessagePattern.getImageByPublicId)
    async getImageByPublicId(@Ctx() context: RmqContext, @Payload() { publicId }: PublicIdDTO) {
        this.rabbitmqService.acknowledgeMessage(context);
        return this.imagesMntService.getImageByPublicId(publicId);
    }

    @MessagePattern(ImagesMntMessagePattern.uploadSingleImage)
    async uploadSingleImage(
        @Ctx() context: RmqContext,
        @Payload() { image, imageUrl }: { image: Express.Multer.File; imageUrl: string },
    ) {
        this.rabbitmqService.acknowledgeMessage(context);
        return this.imagesMntService.uploadSingleImage({
            image,
            imageUrl,
        });
    }

    @MessagePattern(ImagesMntMessagePattern.uploadArrayImage)
    async uploadArrayImage(
        @Ctx() context: RmqContext,
        @Payload() { images, imageUrls }: { images: Express.Multer.File[]; imageUrls: string[] },
    ) {
        this.rabbitmqService.acknowledgeMessage(context);
        return this.imagesMntService.uploadArrayImage({ images, imageUrls });
    }
}
