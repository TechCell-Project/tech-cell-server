import { Inject, Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as morgan from 'morgan';
import * as fs from 'fs';
import * as path from 'path';
import { SAMPLE_SERVICE } from '~/constants';
import { ClientRMQ } from '@nestjs/microservices';
import { formatLogsDiscord, isEnable } from '@app/common';
import { SampleEventPattern } from '~/apps/sample';

@Injectable()
export class MorganMiddleware implements NestMiddleware {
    constructor(@Inject(SAMPLE_SERVICE) private readonly sampleService: ClientRMQ) {}

    private readonly logger = new Logger(MorganMiddleware.name);

    use(req: Request, res: Response, next: NextFunction) {
        if (!isEnable(process.env.LOGS_IS_ENABLE)) {
            /**
             * if logs is not enable, just skip this middleware
             * LOGS_IS_ENABLE is need to be set to `true` or `1` or `on` to enable logs
             */
            return next();
        }

        function logsToFile(message: string) {
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

            return logStream.write(message.trim() + '\n');
        }

        function writeFc(message: string) {
            try {
                if (isEnable(process.env.LOGS_TO_CONSOLE)) {
                    this.logger.log(message.trim());
                }

                if (isEnable(process.env.LOGS_TO_FILE)) {
                    logsToFile(message);
                }

                if (isEnable(process.env.LOGS_TO_DISCORD)) {
                    this.sampleService.emit(SampleEventPattern.writeLogsToDiscord, {
                        message: formatLogsDiscord(message, req, res),
                    });
                }
            } catch (error) {
                this.logger.error(error);
            }
        }

        morgan('combined', {
            stream: {
                write: writeFc,
            },
        })(req, res, next);
    }
}
