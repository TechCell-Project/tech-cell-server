import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
    ServiceUnavailableException,
} from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { ThrottlerException } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { UtilityEventPattern } from '~apps/utility/utility.pattern';
import { I18nTranslations } from '~libs/common/i18n/generated/i18n.generated';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);
    constructor(private readonly utilityService: ClientRMQ) {
        this.utilityService = utilityService;
    }

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const i18n = I18nContext.current<I18nTranslations>(host);

        const sendResponse = (status: HttpStatus, message: string, error: object | string) => {
            return response.status(status).json({
                timestamps: new Date().toISOString(),
                path: request.url,
                message,
                statusCode: status,
                ...(typeof error === 'string' ? { error } : error),
            });
        };

        try {
            const error: object | string = exception.getResponse();

            const exceptionMessage =
                exception?.message ?? exception?.toString() ?? 'Unexpected error when logging';
            this.utilityService.emit(UtilityEventPattern.writeLogsBashToDiscord, {
                message: `${new Date().toLocaleString('en-GB')} - ${
                    request.url
                } - ${exceptionMessage}`,
            });

            switch (true) {
                case exception instanceof ThrottlerException:
                    return sendResponse(
                        HttpStatus.TOO_MANY_REQUESTS,
                        i18n.t('exception.ThrottleException'),
                        error,
                    );
                case exception instanceof ServiceUnavailableException:
                    return sendResponse(
                        HttpStatus.SERVICE_UNAVAILABLE,
                        i18n.t('exception.ServiceUnavailableException'),
                        error,
                    );
                case exception instanceof HttpException: {
                    return sendResponse(
                        exception.getStatus(),
                        typeof error === 'string' ? error : error['message'],
                        error,
                    );
                }
                case typeof error === 'string': {
                    const responseMessage: string =
                        error['message'] ?? i18n.t('exception.InternalServerException');
                    return sendResponse(HttpStatus.INTERNAL_SERVER_ERROR, responseMessage, error);
                }
                default: {
                    const responseMessage: string =
                        error['message'] ?? i18n.t('exception.InternalServerException');
                    const statusCode = error
                        ? error['statusCode'] ?? error['status']
                        : HttpStatus.INTERNAL_SERVER_ERROR;
                    return sendResponse(statusCode, responseMessage, error);
                }
            }
        } catch (error) {
            return sendResponse(HttpStatus.INTERNAL_SERVER_ERROR, error, error);
        }
    }
}
