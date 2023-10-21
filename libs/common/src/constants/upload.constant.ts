import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export class UploadConstants {
    private static instance: UploadConstants;
    private readonly UPLOAD_PATH: string;

    constructor() {
        this.UPLOAD_PATH = join(process.cwd(), 'uploads');
        if (!existsSync(this.UPLOAD_PATH)) {
            mkdirSync(this.UPLOAD_PATH);
        }
    }

    static getInstance() {
        if (!UploadConstants.instance) {
            UploadConstants.instance = new UploadConstants();
        }
        return UploadConstants.instance;
    }

    static get uploadPath() {
        return UploadConstants.getInstance().uploadPath;
    }

    get uploadPath() {
        return this.UPLOAD_PATH;
    }
}
