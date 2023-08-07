import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
    uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
        const options: UploadApiOptions = {
            folder: 'TechCell',
            allowedFormats: ['jpg', 'png', 'webp'],
            public_id: file.fieldname + Date.now(),
        };

        return new Promise<CloudinaryResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            });

            const fileBuffer = Buffer.isBuffer(file.buffer)
                ? file.buffer
                : Buffer.from(file.buffer);
            streamifier.createReadStream(fileBuffer).pipe(uploadStream);
        });
    }

    deleteFile(publicId: string): Promise<CloudinaryResponse> {
        return new Promise<CloudinaryResponse>((resolve, reject) => {
            cloudinary.uploader.destroy(publicId, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
}
