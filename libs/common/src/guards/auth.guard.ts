import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
    ForbiddenException,
    Logger,
    HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientRMQ, RmqContext, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom, of } from 'rxjs';
import { ITokenVerifiedResponse, AuthMessagePattern } from '~apps/auth';
import { AUTH_SERVICE } from '~libs/common/constants';
import { TCurrentUser } from '../types';
import { UserRole } from '~libs/resource/users/enums';
import { Socket } from 'socket.io';
import { Request } from 'express';
import { WsException } from '@nestjs/websockets';
import { RequestType } from '../types/current-request-type';
import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/generated/i18n.generated';
import { RequiredRoles } from '../decorators';

/**
 * @description Base Auth Guard, verify jwt token from request and add user to request if login success
 */
@Injectable()
export class AuthGuard implements CanActivate {
    @Inject(AUTH_SERVICE) protected readonly authService: ClientRMQ;
    public readonly _acceptRoles: string[] = [];
    protected logger: Logger = new Logger(AuthGuard.name);
    protected _reflector: Reflector;

    constructor(private reflector: Reflector) {
        this._reflector = this.reflector;
        this._acceptRoles = [];
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const i18n = I18nContext.current<I18nTranslations>();

        const requiredRoles = this._reflector.getAllAndOverride<UserRole[]>(RequiredRoles.name, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (requiredRoles) {
            this._acceptRoles.push(...requiredRoles);
        }

        const userFromRequest = this.getUserFromContext(context) ?? null;
        if (userFromRequest && this._acceptRoles.includes(userFromRequest.role)) {
            return true;
        }

        const { authHeader, requestType } = this.getAccessToken(context, i18n);

        const authHeaderParts = authHeader?.split(' ');
        if (authHeaderParts && authHeaderParts?.length !== 2) {
            this.throwException(
                new UnauthorizedException(
                    i18n.translate('errorMessage.PROPERTY_IS_INVALID', {
                        args: {
                            property: 'Token',
                        },
                    }),
                ),
                requestType,
            );
            return false;
        }
        const [, jwt] = authHeaderParts;

        const dataVerified: ITokenVerifiedResponse = await firstValueFrom(
            this.authService.send(AuthMessagePattern.verifyJwt, { jwt }).pipe(
                catchError((error) => {
                    if (
                        error?.status === HttpStatus.UNAUTHORIZED ||
                        error?.statusCode === HttpStatus.UNAUTHORIZED
                    ) {
                        this.throwException(
                            new UnauthorizedException(
                                i18n.t('errorMessage.AUTH_ACCESS_TOKEN_IS_EXPIRED'),
                            ),
                            requestType,
                        );
                    }
                    this.throwException(error, requestType);
                    return of(null);
                }),
            ),
        );

        if (!dataVerified.role || !this._acceptRoles.includes(dataVerified.role)) {
            this.throwException(
                new ForbiddenException(i18n.t('errorMessage.FORBIDDEN_ROLE')),
                requestType,
            );
        }

        // Check if token is expired
        if (!dataVerified.exp) {
            this.throwException(
                new UnauthorizedException(i18n.t('errorMessage.AUTH_ACCESS_TOKEN_IS_EXPIRED')),
                requestType,
            );
        }
        const TOKEN_EXP_MS = dataVerified.exp * 1000;
        const isJwtValid = Date.now() < TOKEN_EXP_MS;
        if (!isJwtValid) {
            this.throwException(
                new UnauthorizedException(i18n.t('errorMessage.AUTH_ACCESS_TOKEN_IS_EXPIRED')),
                requestType,
            );
        }
        this.addUserToRequest(dataVerified, context);
        return isJwtValid;
    }

    /**
     * Add user to request
     * @param user The user to add to request
     * @param context The execution context of the current call
     */
    protected addUserToRequest(user: TCurrentUser, context: ExecutionContext) {
        switch (context.getType()?.toLowerCase()) {
            case RequestType.Http:
                {
                    const request: Request = context.switchToHttp().getRequest();
                    request.user = user;
                }
                break;
            case RequestType.Rpc:
                {
                    const ctx = context.switchToRpc().getData();
                    ctx.user = user;
                }
                break;
            case RequestType.Ws:
                {
                    const client: Socket = context.switchToWs().getClient();
                    client.handshake.auth.user = user;
                }
                break;
            default:
                break;
        }
    }

    protected getUserFromContext = (context: ExecutionContext): TCurrentUser | null => {
        switch (context.getType()?.toLowerCase()) {
            case RequestType.Http: {
                const request = context.switchToHttp().getRequest();
                return request?.user ?? null;
            }
            case RequestType.Rpc: {
                const ctx = context.switchToRpc().getData();
                return ctx?.user ?? null;
            }
            case RequestType.Ws: {
                const client = context.switchToWs().getClient();
                return client?.handshake?.auth?.user ?? null;
            }
            default:
                return null;
        }
    };

    /**
     * Get access token from request
     * @param context The execution context of the current call
     * @returns The authorization header and the type of request
     */
    protected getAccessToken(
        context: ExecutionContext,
        i18n: I18nContext<I18nTranslations>,
    ): {
        authHeader: string | undefined;
        requestType: RequestType;
    } {
        let authHeader: string | undefined = undefined;
        let requestType: undefined | RequestType = undefined;

        const accessTokenMissingException = new UnauthorizedException(
            i18n.t('errorMessage.AUTH_ACCESS_TOKEN_IS_MISSING'),
        );

        if (context.getType() === RequestType.Http) {
            const request: Request = context.switchToHttp().getRequest();
            authHeader = request.headers?.authorization;
            requestType = RequestType.Http;
            if (!authHeader) {
                throw accessTokenMissingException;
            }
        } else if (context.getType() === RequestType.Ws) {
            const client: Socket = context.switchToWs().getClient();
            authHeader = client.handshake?.headers?.authorization;
            requestType = RequestType.Ws;
            if (!authHeader) {
                throw new WsException(accessTokenMissingException);
            }
        } else if (context.getType() === RequestType.Rpc) {
            const ctx: RmqContext = context.switchToRpc().getContext();
            authHeader = ctx?.['headers']?.['authorization'];
            requestType = RequestType.Rpc;
            if (!authHeader) {
                throw new RpcException(accessTokenMissingException);
            }
        }

        if (!requestType) throw new Error('Request type is not defined' + context.getType());
        if (!authHeader) throw new Error('Authorization header is not defined');

        return { authHeader, requestType: requestType };
    }

    /**
     * Re-throw error with correct type of request
     * @param error The error to throw
     * @param requestType Type of request
     */
    protected throwException(error: any, requestType: RequestType): void {
        switch (requestType) {
            case RequestType.Ws:
                throw new WsException(error);
            case RequestType.Rpc:
                throw new RpcException(error);
            case RequestType.Http:
            default:
                delete error?.response;
                throw new RpcException(error);
        }
    }
}
