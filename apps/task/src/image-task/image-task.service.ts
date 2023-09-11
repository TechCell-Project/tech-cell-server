import { CloudinaryService } from '@app/common/Cloudinary';
import { ProductsService } from '@app/resource/products';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ImageTaskService {
    private readonly logger = new Logger(ImageTaskService.name);

    constructor(
        private readonly cloudinaryService: CloudinaryService,
        private readonly productsService: ProductsService,
    ) {}

    /**
     * Auto remove unused image in cloudinary on 7:00 AM every day
     * @param next_cursor
     */
    @Cron('0 7 * * *')
    async removeUnusedImage(next_cursor: null | string = null) {
        this.logger.log('Start remove unused image in cloudinary on 7:00 AM every day');
        // Prepare data for remove unused image
        const images = await this.cloudinaryService.getImagesInFolder({
            maxResults: 10,
            next_cursor,
        });

        // Remove unused image
        for (const image of images.resources) {
            this.logger.log(`Check image ${image.public_id}`);
            const isImageInUse = await this.productsService.isImageInUse(image.public_id);
            if (!isImageInUse) {
                await this.cloudinaryService.deleteFile(image.public_id).then(() => {
                    this.logger.log(`Delete image ${image.public_id} success`);
                });
                this.logger.log(`Delete image ${image.public_id}`);
            }
        }

        // Continue remove unused image if next_cursor is not null
        if (images.resources[images.resources.length - 1]?.next_cursor != null) {
            this.logger.log('Waiting for 10 seconds before continuing');
            await new Promise((resolve) => setTimeout(resolve, 1000 * 10));
            this.logger.log('Continue remove unused image');
            await this.removeUnusedImage(images.resources[images.resources.length - 1].next_cursor);
        } else {
            this.logger.log('Finish remove unused image');
        }
    }
}
