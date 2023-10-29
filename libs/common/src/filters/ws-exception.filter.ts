import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(WsException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
    catch(exception: WsException, host: ArgumentsHost) {
        const client: Socket = host.switchToWs().getClient();
        const data = host.switchToWs().getData();
        const error = exception.getError();
        const details = error instanceof Object ? { ...error } : { message: error };
        client.send(
            JSON.stringify({
                event: 'error',
                data: {
                    id: (client as any).id,
                    rid: data.rid,
                    ...details,
                },
            }),
        );
    }
}
