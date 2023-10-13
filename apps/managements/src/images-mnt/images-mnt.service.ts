import {
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { CloudinaryService } from '@app/third-party/cloudinary.com';
import { ImageUploadedResponseDTO } from './dtos/image-uploaded-response.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ImagesMntService {
    private readonly logger = new Logger(ImagesMntService.name);
    constructor(private readonly cloudinaryService: CloudinaryService) {}

    async getImages() {
        try {
            const images = await this.cloudinaryService.getImagesInFolder({
                next_cursor: null,
            });
            return {
                images,
            };
        } catch (error) {
            this.logger.error(error);
            throw new RpcException(
                new InternalServerErrorException('Get image failed, try again later'),
            );
        }
    }

    async getImageByPublicId(publicId: string) {
        try {
            const image = await this.cloudinaryService.getImageByPublicId(publicId);
            return new ImageUploadedResponseDTO(image);
        } catch (error) {
            this.logger.error(error);
            if (error.http_code === 404) {
                throw new RpcException(new NotFoundException('Image not found'));
            }
            throw new RpcException(
                new InternalServerErrorException('Get image failed, try again later'),
            );
        }
    }

    async uploadSingleImage(image: Express.Multer.File) {
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

    async uploadArrayImage(images: Express.Multer.File[]) {
        try {
            const uploadedImages = await Promise.all(
                images.map((image) => this.cloudinaryService.uploadImage(image)),
            );
            return {
                data: uploadedImages.map((image) => new ImageUploadedResponseDTO(image)),
            };
        } catch (error) {
            this.logger.error(error);
            throw new RpcException(
                new InternalServerErrorException('Upload image failed, try again later'),
            );
        }
    }
}
