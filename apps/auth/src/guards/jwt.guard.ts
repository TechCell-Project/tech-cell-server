import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
    handleRequest(err, user, info, context, status) {
        if (err || !user) {
            throw new RpcException(new UnauthorizedException(err || 'User not authorized'));
        }
        return { ...user, info, context, status };
    }
}
