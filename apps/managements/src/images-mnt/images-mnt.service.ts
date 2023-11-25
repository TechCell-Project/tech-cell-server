import {
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { CloudinaryService } from '~libs/third-party/cloudinary.com';
import { ImageUploadedResponseDTO } from './dtos/image-uploaded-response.dto';
import { RpcException } from '@nestjs/microservices';
import { HttpService } from '@nestjs/axios';
import { I18n, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '~libs/common/i18n/generated/i18n.generated';

@Injectable()
export class ImagesMntService {
    private readonly logger = new Logger(ImagesMntService.name);
    constructor(
        private readonly cloudinaryService: CloudinaryService,
        private readonly httpService: HttpService,
        @I18n() private readonly i18n: I18nService<I18nTranslations>,
    ) {}

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
                new InternalServerErrorException(this.i18n.t('errorMessage.GET_IMAGES_FAILED')),
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
                throw new RpcException(
                    new NotFoundException(
                        this.i18n.t('errorMessage.PROPERTY_IS_NOT_FOUND', {
                            args: {
                                property: 'Image',
                            },
                        }),
                    ),
                );
            }
            throw new RpcException(
                new InternalServerErrorException(this.i18n.t('errorMessage.GET_IMAGES_FAILED')),
            );
        }
    }

    async uploadSingleImage({ image, imageUrl }: { image: Express.Multer.File; imageUrl: string }) {
        try {
            const response = await this.httpService.axiosRef({
                url: imageUrl,
                method: 'GET',
                responseType: 'arraybuffer',
            });
            const fileBuffer = Buffer.from(response.data, 'binary');
            Object.assign(image, {
                buffer: fileBuffer,
            });
            const uploadedImage = await this.cloudinaryService.uploadImage(image);
            return { ...new ImageUploadedResponseDTO(uploadedImage) };
        } catch (error) {
            this.logger.error(error);
            throw new RpcException(
                new InternalServerErrorException(this.i18n.t('errorMessage.UPLOAD_IMAGES_FAILED')),
            );
        }
    }

    async uploadArrayImage({
        images,
        imageUrls,
    }: {
        images: Express.Multer.File[];
        imageUrls: string[];
    }) {
        const resolve = [];
        for (let i = 0; i < images.length && i < imageUrls.length; i++) {
            resolve.push(
                this.uploadSingleImage({
                    image: images[i],
                    imageUrl: imageUrls[i],
                }),
            );
        }
        const uploadedImages = await Promise.all(resolve);
        return {
            data: uploadedImages,
        };
    }
}
