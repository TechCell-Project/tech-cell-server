import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
    catch(exception: RpcException, host: ArgumentsHost) {
        const error: object | string = exception.getError();
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (typeof error === 'string') {
            return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error });
        }

        const statusCode = error
            ? error['statusCode'] ?? error['status']
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const errorMessage = error ?? { message: 'Internal server error', statusCode };

        return response.status(statusCode).json({ ...errorMessage });
    }
}
