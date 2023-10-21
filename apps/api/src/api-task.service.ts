import { UploadConstants } from '@app/common/constants/upload.constant';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { promisify } from 'util';
import { readdir, unlink, stat } from 'fs';
import { join } from 'path';

@Injectable()
export class ApiTaskService {
    private readonly logger = new Logger(ApiTaskService.name);
    private readonly uploadFolder = UploadConstants.uploadPath;

    /**
     * Clean the upload folder every 30 minutes to remove files older than 30 minutes
     */
    @Cron('*/30 * * * *')
    async cleanUploadsFolder() {
        const cleanFolder = this.uploadFolder;
        this.logger.log(`Start clean folder ${cleanFolder}`);

        const now = Date.now();
        const files = await promisify(readdir)(cleanFolder);
        const deletePromises = files.map(async (file) => {
            const filePath = join(cleanFolder, file);
            const { birthtimeMs } = await promisify(stat)(filePath);
            const ageInMinutes = (now - birthtimeMs) / (1000 * 60);
            if (ageInMinutes >= 30) {
                await promisify(unlink)(filePath);
                this.logger.log(`Deleted file ${filePath}`);
            } else {
                this.logger.log(`Skipped file ${filePath}`);
            }
        });

        await Promise.all(deletePromises);

        this.logger.log(`Finished cleaning folder ${cleanFolder}`);
    }
}
