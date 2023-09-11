import { RabbitMQService } from '@app/common';
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
        @Payload() { image }: { image: Express.Multer.File },
    ) {
        this.rabbitmqService.acknowledgeMessage(context);
        return this.imagesMntService.uploadSingleImage(image);
    }
}
