import { Injectable, ExecutionContext } from '@nestjs/common';
import { I18nResolver, I18nResolverOptions } from 'nestjs-i18n';
import { Socket } from 'socket.io';

@Injectable()
export class SocketHeaderResolver implements I18nResolver {
    constructor(@I18nResolverOptions() private keys: string[] = []) {}

    resolve(context: ExecutionContext) {
        let language: string;

        if (context.getType() === 'ws') {
            const client: Socket = context.switchToWs().getClient();
            const headers = client.handshake?.headers as Record<string, string>;
            for (const key of this.keys) {
                if (headers?.[key] !== undefined && headers?.[key] !== null) {
                    language = headers?.[key];
                    break;
                }
            }
        }
        return language;
    }
}
