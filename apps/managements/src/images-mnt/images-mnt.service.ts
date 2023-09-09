import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CloudinaryService } from '@app/common/Cloudinary';
import { ImageUploadedResponseDTO } from './dtos/image-uploaded-response.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ImagesMntService {
    private readonly logger = new Logger(ImagesMntService.name);
    constructor(private readonly cloudinaryService: CloudinaryService) {}

    async getImages() {
        try {
            const images = await this.cloudinaryService.getImagesInFolder();
            return { images };
        } catch (error) {
            this.logger.error(error);
            throw new RpcException(
                new InternalServerErrorException('Get image failed, try again later'),
            );
        }
    }

    async uploadImages(image: Express.Multer.File) {
        try {
            const uploadedImage = await this.cloudinaryService.uploadImage(image);
            return { ...new ImageUploadedResponseDTO(uploadedImage) };
        } catch (error) {
            this.logger.error(error);
            throw new RpcException(
                new InternalServerErrorException('Upload image failed, try again later'),
            );
        }
    }
}
