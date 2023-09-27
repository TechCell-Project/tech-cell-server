import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { TCurrentUser } from '../types';

export const getCurrentUserByContext = (context: ExecutionContext): TCurrentUser => {
    if (context.getType() === 'http') {
        const request = context.switchToHttp().getRequest();
        return request.user;
    }

    if (context.getType() === 'rpc') {
        const ctx = context.switchToRpc().getData();
        return ctx.user;
    }
};

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
