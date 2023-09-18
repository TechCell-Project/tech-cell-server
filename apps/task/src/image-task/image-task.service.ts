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
    async removeUnusedImage(next_cursor?: string, maxResults?: number) {
        const RESULT_PER_REQUEST = 100;

        this.logger.log('Start remove unused image in cloudinary on 7:00 AM every day');
        // Prepare data for remove unused image
        const images = await this.cloudinaryService.getImagesInFolder({
            maxResults: maxResults || RESULT_PER_REQUEST,
            next_cursor,
        });

        // Remove unused image
        for (const image of images.resources) {
            this.logger.log(`Check image ${image.public_id}`);
            const isImageInUse = await this.productsService.isImageInUse(image.public_id);
            if (!isImageInUse) {
                await this.cloudinaryService.deleteFile(image.public_id).then(() => {
                    this.logger.verbose(`Deleted:: '${image.public_id}'`);
                });
            } else {
                this.logger.warn(`Image in use:: '${image.public_id}'`);
            }
        }

        // Continue remove unused image if next_cursor is not null
        if (images['next_cursor'] != null) {
            if (images['rate_limit_remaining'] <= RESULT_PER_REQUEST) {
                const resetAt = new Date(images['rate_limit_reset_at'] * 1000);
                this.logger.log(`Rate limit exceeded. Reset at ${resetAt}`);

                // Wait until rate limit has been reset
                const now = new Date();
                const timeToReset = resetAt.getTime() - now.getTime();
                await new Promise((resolve) => setTimeout(resolve, timeToReset));

                this.logger.log('Rate limit has been reset. Continuing remove unused image');
                await this.removeUnusedImage(images['next_cursor']);
            } else {
                this.logger.log('Waiting for 30 minutes before continuing');
                await new Promise((resolve) => setTimeout(resolve, 1000 * 60 * 30));
                this.logger.log('Continue remove unused image');
                await this.removeUnusedImage(images['next_cursor']);
            }
        } else {
            this.logger.log('Finish remove unused image');
        }
    }
}
