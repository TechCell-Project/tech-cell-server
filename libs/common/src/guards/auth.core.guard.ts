import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientRMQ, RmqContext, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom, of } from 'rxjs';
import { ITokenVerifiedResponse, AuthMessagePattern } from '~apps/auth';
import {
    AUTH_SERVICE,
    SKIP_AUTH_SUPER_ADMIN_GUARD,
    SKIP_AUTH_ADMIN_GUARD,
    SKIP_AUTH_MOD_GUARD,
    SKIP_AUTH_GUARD,
} from '~libs/common/constants';
import { TCurrentUser } from '../types';
import { UserRole } from '~libs/resource/users/enums';
import { Socket } from 'socket.io';
import { Request } from 'express';
import { WsException } from '@nestjs/websockets';
import { RequestType } from '../types/current-request-type';

/**
 * @description Base Auth Guard, verify jwt token from request and add user to request if login success
 */
@Injectable()
export class AuthCoreGuard implements CanActivate {
    @Inject(AUTH_SERVICE) protected readonly authService: ClientRMQ;
    protected readonly _acceptRoles: string[];
    protected logger: Logger;

    constructor(protected reflector: Reflector, guardName?: string) {
        this._acceptRoles = [];
        this.logger = new Logger(guardName ?? AuthCoreGuard.name);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (this.resolveSkipAuth(context)) {
            return true;
        }

        const { authHeader, requestType } = this.getAccessToken(context);

        const authHeaderParts = authHeader?.split(' ');
        if (authHeaderParts && authHeaderParts?.length !== 2) {
            this.throwException(new UnauthorizedException(), requestType);
            return false;
        }
        const [, jwt] = authHeaderParts;

        const dataVerified: ITokenVerifiedResponse = await firstValueFrom(
            this.authService.send(AuthMessagePattern.verifyJwt, { jwt }).pipe(
                catchError((error) => {
                    this.throwException(error, requestType);
                    return of(null);
                }),
            ),
        );

        if (!dataVerified.role || !this._acceptRoles.includes(dataVerified.role)) {
            this.throwException(new ForbiddenException('Forbidden permission'), requestType);
        }

        // Check if token is expired
        if (!dataVerified.exp) {
            this.throwException(new UnauthorizedException(), requestType);
        }
        const TOKEN_EXP_MS = dataVerified.exp * 1000;
        const isJwtValid = Date.now() < TOKEN_EXP_MS;
        if (!isJwtValid) {
            this.throwException(new UnauthorizedException('Token expired'), requestType);
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
                const request: Request = context.switchToHttp().getRequest();
                request.user = user;
                break;
            case RequestType.Rpc:
                const ctx = context.switchToRpc().getData();
                ctx.user = user;
                break;
            case RequestType.Ws:
                const client: Socket = context.switchToWs().getClient();
                client.handshake.auth.user = user;
                break;
            default:
                break;
        }
    }

    private resolveSkipAuth(context: ExecutionContext): boolean {
        try {
            if (
                this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_GUARD, [
                    context.getHandler(),
                    context.getClass(),
                ])
            ) {
                return true;
            }

            if (
                this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_SUPER_ADMIN_GUARD, [
                    context.getHandler(),
                    context.getClass(),
                ])
            ) {
                this._acceptRoles.splice(
                    0,
                    this._acceptRoles.length,
                    ...this._acceptRoles.filter((role) => role !== UserRole.SuperAdmin),
                );
            }

            if (
                this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_ADMIN_GUARD, [
                    context.getHandler(),
                    context.getClass(),
                ])
            ) {
                this._acceptRoles.splice(
                    0,
                    this._acceptRoles.length,
                    ...this._acceptRoles.filter((role) => role !== UserRole.Admin),
                );
            }

            if (
                this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_MOD_GUARD, [
                    context.getHandler(),
                    context.getClass(),
                ])
            ) {
                this._acceptRoles.splice(
                    0,
                    this._acceptRoles.length,
                    ...this._acceptRoles.filter((role) => role !== UserRole.Mod),
                );
            }

            return false;
        } catch (error) {
            this.logger.error(error);
            return false;
        }
    }

    /**
     * Get access token from request
     * @param context The execution context of the current call
     * @returns The authorization header and the type of request
     */
    private getAccessToken(context: ExecutionContext): {
        authHeader: string | undefined;
        requestType: RequestType;
    } {
        let authHeader: string | undefined = undefined;
        let requestType: undefined | RequestType = undefined;

        if (context.getType() === RequestType.Http) {
            const request: Request = context.switchToHttp().getRequest();
            authHeader = request.headers?.authorization;
            requestType = RequestType.Http;
            if (!authHeader) {
                throw new UnauthorizedException();
            }
        } else if (context.getType() === RequestType.Ws) {
            const client: Socket = context.switchToWs().getClient();
            authHeader = client.handshake?.headers?.authorization;
            requestType = RequestType.Ws;
            if (!authHeader) {
                throw new WsException(new UnauthorizedException());
            }
        } else if (context.getType() === RequestType.Rpc) {
            const ctx: RmqContext = context.switchToRpc().getContext();
            authHeader = ctx?.['headers']?.['authorization'];
            requestType = RequestType.Rpc;
            if (!authHeader) {
                throw new RpcException(new UnauthorizedException());
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
    private throwException(error: any, requestType: RequestType): void {
        switch (requestType) {
            case RequestType.Ws:
                throw new WsException(error);
            case RequestType.Rpc:
                throw new RpcException(error);
            case RequestType.Http:
            default:
                throw new RpcException(error);
        }
    }
}
