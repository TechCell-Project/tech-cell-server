import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { RpcException } from '@nestjs/microservices';

@Catch(HttpException, ExceptionsHandler)
export class RpcValidationFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        return new RpcException(exception.getResponse());
    }
}
