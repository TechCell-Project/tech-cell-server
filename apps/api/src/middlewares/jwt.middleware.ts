import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

/**
 * @description Decode JWT token and add `_id` to `req.body.userId`
 */
@Injectable()
export class JwtMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return next();
        }
        const authHeaderParts = (authHeader as string).split(' ');
        if (authHeaderParts.length !== 2) {
            return next();
        }
        const [, token] = authHeaderParts;

        const decoded = jwt.decode(token);
        if (typeof decoded === 'object' && decoded !== null) {
            req.body.userId = decoded._id;
        }

        next();
    }
}
