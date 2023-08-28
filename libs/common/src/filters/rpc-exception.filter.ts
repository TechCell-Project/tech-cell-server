import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
    catch(exception: RpcException, host: ArgumentsHost) {
        const error: any = exception.getError();
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const statusCode = error ? error.statusCode ?? error.status : 500;
        const errorMessage = error ?? { message: 'Internal server error', statusCode };

        response.status(statusCode).json({ ...errorMessage });
    }
}
