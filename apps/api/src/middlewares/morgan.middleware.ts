import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as morgan from 'morgan';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MorganMiddleware implements NestMiddleware {
    private readonly logger = new Logger(MorganMiddleware.name);

    use(req: Request, res: Response, next: NextFunction) {
        const logDirectory = path.join(__dirname, `../../../logs`);
        fs.mkdirSync(logDirectory, { recursive: true });

        const currentDate = new Date();
        const day = currentDate.getDate().toString().padStart(2, '0');
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const year = currentDate.getFullYear().toString();
        const fileName = `logs_${day}-${month}-${year}.log`;

        const logStream = fs.createWriteStream(path.join(logDirectory, fileName), {
            flags: 'a',
        });

        morgan('combined', {
            stream: {
                write: (message: string) => {
                    this.logger.log(message.trim());
                    logStream.write(message.trim() + '\n');
                },
            },
        })(req, res, next);
    }
}
