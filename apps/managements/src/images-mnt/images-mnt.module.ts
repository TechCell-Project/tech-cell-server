import { Module } from '@nestjs/common';
import { ImagesMntController } from './images-mnt.controller';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { CloudinaryService } from '@app/third-party/cloudinary.com';
import { ImagesMntService } from './images-mnt.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule],
    controllers: [ImagesMntController],
    providers: [RabbitMQService, ImagesMntService, CloudinaryService],
})
export class ImagesMntModule {}
