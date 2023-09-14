import { generateRandomString } from '../utils';

/**
 *
 * @description Build a publicId string for cloudinary, max length is 24
 * @param file file to get metadata
 * @returns A publicId string for cloudinary
 */
export function buildPublicId(file: Express.Multer.File) {
    const MAX_LENGTH = 24;
    const originalname = file?.originalname?.slice(0, MAX_LENGTH / 2);
    const timestamp = Math.floor(Date.now() / 1000).toString();

    return `${originalname?.split('.').join('_')}_${timestamp}_${generateRandomString(
        MAX_LENGTH - originalname.length,
    )}`.slice(0, MAX_LENGTH);
}
