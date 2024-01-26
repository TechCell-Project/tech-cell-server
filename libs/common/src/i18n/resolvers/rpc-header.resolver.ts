import { Injectable, ExecutionContext } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { I18nResolver, I18nResolverOptions } from 'nestjs-i18n';

@Injectable()
export class RabbitMQHeaderResolver implements I18nResolver {
    constructor(@I18nResolverOptions() private keys: string[] = []) {}

    resolve(context: ExecutionContext) {
        let language: string;
        if (context.getType() === 'rpc') {
            const rmqContext: RmqContext = context.switchToRpc().getContext();
            const headers = rmqContext?.getMessage()?.properties?.headers;
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
