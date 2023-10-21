import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export class UploadConstants {
    private static instance: UploadConstants;

    private static readonly UPLOAD_FOLDER_NAME = 'uploads';
    private readonly UPLOAD_FOLDER_DIR: string;

    public static readonly MULTER_FOLDER_TMP_NAME = 'multer_tmp';
    private readonly MULTER_DEST_TMP_DIR: string;

    constructor() {
        this.UPLOAD_FOLDER_DIR = join(process.cwd(), UploadConstants.UPLOAD_FOLDER_NAME);
        if (!existsSync(this.UPLOAD_FOLDER_DIR)) {
            mkdirSync(this.UPLOAD_FOLDER_DIR);
        }

        this.MULTER_DEST_TMP_DIR = join(
            this.UPLOAD_FOLDER_DIR,
            UploadConstants.MULTER_FOLDER_TMP_NAME,
        );
        if (!existsSync(this.MULTER_DEST_TMP_DIR)) {
            mkdirSync(this.MULTER_DEST_TMP_DIR);
        }
    }

    static getInstance() {
        if (!UploadConstants.instance) {
            UploadConstants.instance = new UploadConstants();
        }
        return UploadConstants.instance;
    }

    static get uploadFolderDir() {
        return UploadConstants.getInstance().UPLOAD_FOLDER_DIR;
    }

    static get multerUploadTmpFolderDir() {
        return UploadConstants.getInstance().MULTER_DEST_TMP_DIR;
    }
}
