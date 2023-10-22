import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export class HostConstants {
    private static instance: HostConstants;
    private readonly UPLOAD_PATH: string;

    constructor() {
        this.UPLOAD_PATH = join(process.cwd(), 'uploads');
        if (!existsSync(this.UPLOAD_PATH)) {
            mkdirSync(this.UPLOAD_PATH);
        }
    }

    static getInstance() {
        if (!HostConstants.instance) {
            HostConstants.instance = new HostConstants();
        }
        return HostConstants.instance;
    }

    static get uploadPath() {
        return HostConstants.getInstance().uploadPath;
    }

    get uploadPath() {
        return this.UPLOAD_PATH;
    }
}
