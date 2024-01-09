import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { ThrottlerException } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { UtilityEventPattern } from '~apps/utility/utility.pattern';
import { I18nTranslations } from '~libs/common/i18n/generated/i18n.generated';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly utilityService: ClientRMQ;
    constructor(utilityService?: ClientRMQ) {
        if (utilityService) {
            this.utilityService = utilityService;
        }
    }

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const i18n = I18nContext.current<I18nTranslations>(host);

        const error: object | string = exception.getResponse();
        const errObj = {
            timestamps: new Date().toISOString(),
            path: request.url,
        };

        if (exception instanceof ThrottlerException) {
            return response.status(HttpStatus.TOO_MANY_REQUESTS).json({
                ...errObj,
                message: i18n.t('exception.ThrottleException'),
                statusCode: HttpStatus.TOO_MANY_REQUESTS,
            });
        }

        if (typeof error === 'string') {
            return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                ...errObj,
                message: error,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }

        const statusCode = error
            ? error['statusCode'] ?? error['status']
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const errorMessage = error ?? {
            message: i18n.t('exception.InternalServerException'),
            statusCode,
        };

        if (this.utilityService) {
            const exceptionMessage =
                exception?.message ?? exception?.toString() ?? 'Unexpected error when logging';
            this.utilityService.emit(UtilityEventPattern.writeLogsBashToDiscord, {
                message: `${new Date().toLocaleString('en-GB')} - ${
                    request.url
                } - ${exceptionMessage}`,
            });
        }

        return response.status(statusCode).json({
            ...errObj,
            ...errorMessage,
            statusCode,
        });
    }
}
