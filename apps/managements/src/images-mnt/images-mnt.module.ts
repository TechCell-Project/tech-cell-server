import { Module } from '@nestjs/common';
import { ImagesMntController } from './images-mnt.controller';
import { RabbitMQService } from '@app/common/RabbitMQ';
import { CloudinaryService } from '@app/common/Cloudinary';
import { ImagesMntService } from './images-mnt.service';

@Module({
    controllers: [ImagesMntController],
    providers: [RabbitMQService, ImagesMntService, CloudinaryService],
})
export class ImagesMntModule {}
