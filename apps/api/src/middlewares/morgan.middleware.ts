import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as morgan from 'morgan';
import { Logger } from '@nestjs/common';

@Injectable()
export class MorganMiddleware implements NestMiddleware {
    private readonly logger = new Logger(MorganMiddleware.name);

    use(req: Request, res: Response, next: NextFunction) {
        morgan('tiny', {
            stream: { write: (message: string) => this.logger.log(message.trim()) },
        })(req, res, next);
    }
}
