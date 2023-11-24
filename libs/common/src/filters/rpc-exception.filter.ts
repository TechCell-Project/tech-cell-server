import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Request, Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '~libs/common/i18n/generated/i18n.generated';

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
    catch(exception: RpcException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const i18n = I18nContext.current<I18nTranslations>(host);

        const error: object | string = exception.getError();
        const errObj = {
            timestamps: new Date().toISOString(),
            path: request.url,
        };

        if (typeof error === 'string') {
            return response
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ ...errObj, message: error, statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
        }

        const statusCode = error
            ? error['statusCode'] ?? error['status']
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const errorMessage = error ?? {
            message: i18n.t('exception.InternalServerException.message'),
            statusCode,
        };

        return response.status(statusCode).json({
            ...errObj,
            ...errorMessage,
            statusCode,
        });
    }
}
