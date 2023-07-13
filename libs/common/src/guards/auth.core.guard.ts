import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import { ClientRMQ, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { ITokenVerifiedResponse, AuthMessagePattern } from '~/apps/auth';
import { AUTH_SERVICE } from '~/constants';
import { ICurrentUser } from '../interfaces';

@Injectable()
export class AuthCoreGuard implements CanActivate {
    @Inject(AUTH_SERVICE) protected readonly authService: ClientRMQ;
    protected readonly _acceptRoles: string[] = [];

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (context.getType() !== 'http') {
            return false;
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

    protected addUserToRequest(user: ICurrentUser, context: ExecutionContext) {
        if (context.getType() === 'http') {
            const request = context.switchToHttp().getRequest();
            request.user = user;
        }

        if (context.getType() === 'rpc') {
            const ctx = context.switchToRpc().getData();
            ctx.user = user;
        }
    }
}
