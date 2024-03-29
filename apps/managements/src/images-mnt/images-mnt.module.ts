import { Module } from '@nestjs/common';
import { ImagesMntController } from './images-mnt.controller';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { CloudinaryService } from '~libs/third-party/cloudinary.com';
import { ImagesMntService } from './images-mnt.service';
import { HttpModule } from '@nestjs/axios';
import { I18nModule } from '~libs/common/i18n';

@Module({
    imports: [HttpModule, I18nModule],
    controllers: [ImagesMntController],
    providers: [RabbitMQService, ImagesMntService, CloudinaryService],
})
export class ImagesMntModule {}
