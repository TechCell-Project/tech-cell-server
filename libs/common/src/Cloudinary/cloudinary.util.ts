import { generateRandomString } from '../utils/shared.util';

export function buildPublicId(file: Express.Multer.File) {
    return `${file.fieldname}_${file.filename ?? generateRandomString(6)}_${file.originalname
        .split('.')
        .join('_')}_${Date.now()}`;
}
