import { Inject, Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as morgan from 'morgan';
import { TokenIndexer } from 'morgan';
import { UTILITY_SERVICE } from '~/constants';
import { ClientRMQ } from '@nestjs/microservices';
import { isEnable } from '@app/common';
import { UtilityEventPattern, LogType } from '~/apps/utility';

interface JsonFormatTokens extends TokenIndexer {
    date: (req: Request, res: Response) => string;
    method: (req: Request, res: Response) => string;
    url: (req: Request, res: Response) => string;
    status: (req: Request, res: Response) => string;
    responseTime: (req: Request, res: Response) => string;
    remoteAddress: (req: Request, res: Response) => string;
    remoteUser: (req: Request, res: Response) => string;
    httpVersion: (req: Request, res: Response) => string;
    userAgent: (req: Request, res: Response) => string;
    referrer: (req: Request, res: Response) => string;
    headers: (req: Request, res: Response) => string;
    queryParameters: (req: Request, res: Response) => string;
    requestBody: (req: Request, res: Response) => string;
}

@Injectable()
export class MorganMiddleware implements NestMiddleware {
    constructor(@Inject(UTILITY_SERVICE) private readonly utilityService: ClientRMQ) {}

    private readonly _logger: Logger = new Logger(MorganMiddleware.name);

    use(req: Request, res: Response, next: NextFunction) {
        /**
         * if logs is not enable, just skip this middleware
         * LOGS_IS_ENABLE is need to be set to `true` or `1` or `on` to enable logs
         */
        if (!isEnable(process.env.LOGS_IS_ENABLE)) {
            return next();
        }

        const writeFc = (message: string) => {
            try {
                const messageExpected = message ? message.trim() : 'Unexpected error when logging';
                if (isEnable(process.env.LOGS_TO_CONSOLE)) {
                    this._logger.log(messageExpected);
                }

                if (isEnable(process.env.LOGS_TO_FILE)) {
                    this.utilityService.emit(UtilityEventPattern.writeLogsToFile, {
                        message: messageExpected,
                        type: LogType.HTTP,
                    });
                }

                if (isEnable(process.env.LOGS_TO_DISCORD)) {
                    this.utilityService.emit(UtilityEventPattern.writeLogsToDiscord, {
                        message: messageExpected,
                    });
                }
            } catch (error) {
                this._logger.error(error ?? 'Unexpected error when logging');
            }
        };

        morgan.format('json', (tokens: JsonFormatTokens, req: Request, res: Response) => {
            return JSON.stringify({
                date: new Date(Date.now()).toLocaleString('en-GB', {
                    timeZone: 'Asia/Bangkok',
                    hour12: false,
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                }),
                method: tokens.method(req, res),
                url: tokens.url(req, res),
                status: tokens.status(req, res),
                responseTime: tokens['response-time'](req, res),
                remoteAddress: tokens['remote-addr'](req, res),
                remoteUser: tokens['remote-user'](req, res),
                httpVersion: tokens['http-version'](req, res),
                userAgent: tokens['user-agent'](req, res),
                referer: tokens.referrer(req, res),
                headers: req.headers,
                queryParameters: req.query,
                requestBody: req.body,
            });
        });

        morgan('json', {
            stream: {
                write: writeFc,
            },
        })(req, res, next);
    }
}
