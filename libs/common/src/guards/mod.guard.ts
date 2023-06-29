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
import { ITokenVerifiedResponse } from '~/apps/auth/interfaces';
import { UserRole } from '@app/resource/users/enums';
import { AUTH_SERVICE } from '~/constants';

@Injectable()
export class ModGuard implements CanActivate {
    constructor(@Inject(AUTH_SERVICE) private readonly authService: ClientRMQ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const acceptRoles: string[] = [UserRole.Admin, UserRole.Mod];

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
            this.authService.send({ cmd: 'verify-jwt' }, { jwt }).pipe(
                catchError((error) => {
                    throw new RpcException(error);
                }),
            ),
        );

        if (!dataVerified.role || !acceptRoles.includes(dataVerified.role)) {
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
        return isJwtValid;
    }
}
