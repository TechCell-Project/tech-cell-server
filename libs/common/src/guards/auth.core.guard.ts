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
import { ClientRMQ, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { ITokenVerifiedResponse, AuthMessagePattern } from '~/apps/auth';
import {
    AUTH_SERVICE,
    SKIP_AUTH_SUPER_ADMIN_GUARD,
    SKIP_AUTH_ADMIN_GUARD,
    SKIP_AUTH_MOD_GUARD,
    SKIP_AUTH_GUARD,
} from '~/constants';
import { TCurrentUser } from '../types';
import { UserRole } from '@app/resource/users/enums';

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
        if (context.getType() !== 'http') {
            return false;
        }

        if (this.resolveSkipAuth(context)) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        if (!authHeader) return false;
        const authHeaderParts = (authHeader as string).split(' ');
        if (authHeaderParts.length !== 2) return false;
        const [, jwt] = authHeaderParts;

        const dataVerified: ITokenVerifiedResponse = await firstValueFrom(
            this.authService.send(AuthMessagePattern.verifyJwt, { jwt }).pipe(
                catchError((error) => {
                    throw new RpcException(error);
                }),
            ),
        );

        if (!dataVerified.role || !this._acceptRoles.includes(dataVerified.role)) {
            throw new ForbiddenException('Forbidden permission');
        }

        // Check if token is expired
        if (!dataVerified.exp) {
            throw new UnauthorizedException();
        }
        const TOKEN_EXP_MS = dataVerified.exp * 1000;
        const isJwtValid = Date.now() < TOKEN_EXP_MS;
        if (!isJwtValid) {
            throw new UnauthorizedException('Token expired');
        }
        this.addUserToRequest(dataVerified, context);
        return isJwtValid;
    }

    protected addUserToRequest(user: TCurrentUser, context: ExecutionContext) {
        if (context.getType() === 'http') {
            const request = context.switchToHttp().getRequest();
            request.user = user;
        }

        if (context.getType() === 'rpc') {
            const ctx = context.switchToRpc().getData();
            ctx.user = user;
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
}
