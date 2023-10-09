import { Injectable } from '@nestjs/common';
import {
    AdminAndResourceOptions,
    v2 as cloudinary,
    ResourceApiResponse,
    UploadApiOptions,
} from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import * as streamifier from 'streamifier';
import { CLOUDINARY_ALLOW_IMAGE_FORMATS, CLOUDINARY_ROOT_FOLDER_NAME } from './cloudinary.constant';
import { buildPublicId } from './cloudinary.util';

@Injectable()
export class CloudinaryService {
    uploadImage(file: Express.Multer.File): Promise<CloudinaryResponse> {
        const options: UploadApiOptions = {
            folder: CLOUDINARY_ROOT_FOLDER_NAME,
            allowedFormats: CLOUDINARY_ALLOW_IMAGE_FORMATS,
            public_id: buildPublicId(file),
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

    getImageByPublicId(publicId: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            cloudinary.api.resource(publicId, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    getImagesInFolder({
        maxResults = 10,
        folderName = CLOUDINARY_ROOT_FOLDER_NAME,
        next_cursor = null,
    }: {
        maxResults?: number;
        folderName?: string;
        next_cursor?: string;
    }): Promise<ResourceApiResponse> {
        const options: AdminAndResourceOptions = {
            resource_type: 'image',
            type: 'upload',
            prefix: folderName,
            max_results: maxResults,
            next_cursor: next_cursor,
        };

        return new Promise<ResourceApiResponse>((resolve, reject) => {
            cloudinary.api.resources(options, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
}
