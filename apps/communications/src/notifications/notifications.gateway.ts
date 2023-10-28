import {
    MessageBody,
    OnGatewayConnection,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { NotificationsMessageSubscribe } from './notifications.message';
import { Inject, Logger } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { ITokenVerifiedResponse } from '~apps/auth/interfaces';
import { AuthMessagePattern } from '~apps/auth/auth.pattern';
import { AUTH_SERVICE } from '@app/common';
import { UserRole } from '@app/resource/users/enums';
import { NotifyRoom } from './constant.notify';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class NotificationsGateway implements OnGatewayConnection {
    private readonly logger = new Logger(NotificationsGateway.name);
    constructor(@Inject(AUTH_SERVICE) private readonly authService: ClientRMQ) {}

    @WebSocketServer()
    private readonly server: Server;

    /**
     * @description Handle connection from client and join to room base on user role and user id
     */
    async handleConnection(client: Socket) {
        const authHeaderParts = client.handshake?.headers?.authorization?.split(' ');
        if (authHeaderParts.length !== 2) {
            client.disconnect(true);
            return;
        }
        const [, jwt] = authHeaderParts;

        const userVerified: ITokenVerifiedResponse = await firstValueFrom(
            this.authService.send(AuthMessagePattern.verifyJwt, { jwt }).pipe(
                catchError(() => {
                    return of(null);
                }),
            ),
        );

        if (!userVerified) {
            return client.disconnect(true);
        }

        const rooms = [NotifyRoom.AllUserRoom, `user_id_${userVerified._id}`];

        if (userVerified.role === UserRole.SuperAdmin) {
            rooms.push(NotifyRoom.SuperAdminRoom, NotifyRoom.AdminRoom);
        }

        if (userVerified.role === UserRole.Admin) {
            rooms.push(NotifyRoom.AdminRoom);
        }

        if (userVerified.role === UserRole.Mod) {
            rooms.push(NotifyRoom.ModRoom);
        }

        if (userVerified.role === UserRole.User) {
            rooms.push(`user_id_${userVerified._id}`);
        }

        return client.join(rooms);
    }

    async newOrderAdmin(@MessageBody() data: any) {
        this.server.to(NotifyRoom.AllUserRoom).emit(NotificationsMessageSubscribe.NewOrderAdmin, {
            time: Date.now().toString(),
            connected: [
                ...(await this.server.in(NotifyRoom.AllUserRoom).fetchSockets()).map(
                    (socket) => socket.id,
                ),
            ].length,
            data,
        });

        return {
            isSuccess: true,
            message: 'success',
        };
    }
}
