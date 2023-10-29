import {
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
    MessageBody,
    SubscribeMessage,
    WsResponse,
} from '@nestjs/websockets';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { NotificationsMessageSubscribe } from '../constants/notifications.message';
import { Logger, UseGuards } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { ITokenVerifiedResponse } from '~apps/auth/interfaces';
import { AuthMessagePattern } from '~apps/auth/auth.pattern';
import { AuthGuard } from '@app/common';
import { UserRole } from '@app/resource/users/enums';
import { NotifyRoom } from '../constants/notifications.constant';
import { NotificationService } from '@app/resource';
import { Types } from 'mongoose';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class NotificationsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    protected logger = new Logger(NotificationsGateway.name);
    protected connectedClients: Map<string, Socket>;

    constructor(
        protected readonly authService: ClientRMQ,
        protected readonly notificationService: NotificationService,
    ) {}

    @WebSocketServer()
    readonly server: Server;

    afterInit() {
        this.logger.log('Notification gateway initialized');
        this.connectedClients = new Map<string, Socket>();
    }

    /**
     * @description Handle connection from client and join to room base on user role and user id
     */
    async handleConnection(client: Socket) {
        const userVerified: ITokenVerifiedResponse | null = await this.authenticateClient(client);
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
            rooms.push(NotifyRoom.UserRoom);
        }

        this.logger.log(`Client ${client.id} connected to ${rooms.join(', ')}`);
        this.connectedClients.set(client.id, client);
        return client.join(rooms);
    }

    /**
     * @description Handle disconnect from client
     */
    async handleDisconnect(client: Socket) {
        this.logger.log(`Client ${client.id} disconnected`);
        this.connectedClients.delete(client.id);
    }

    @UseGuards(AuthGuard)
    @SubscribeMessage(NotificationsMessageSubscribe.MarkNotificationAsRead)
    async markNotificationAsRead(
        @MessageBody() { notificationId }: { notificationId: string },
    ): Promise<
        WsResponse<{
            isSuccess: boolean;
            message: string;
        }>
    > {
        if (!notificationId) {
            return {
                event: NotificationsMessageSubscribe.MarkNotificationAsRead,
                data: {
                    isSuccess: false,
                    message: 'Notification id is required',
                },
            };
        }

        if (!Types.ObjectId.isValid(notificationId)) {
            return {
                event: NotificationsMessageSubscribe.MarkNotificationAsRead,
                data: {
                    isSuccess: false,
                    message: 'Notification id is invalid',
                },
            };
        }

        const notification = await this.notificationService.markNotificationAsRead(
            new Types.ObjectId(notificationId),
        );
        if (notification === null) {
            return {
                event: NotificationsMessageSubscribe.MarkNotificationAsRead,
                data: {
                    isSuccess: false,
                    message: 'Notification not found',
                },
            };
        }

        if (notification === false) {
            return {
                event: NotificationsMessageSubscribe.MarkNotificationAsRead,
                data: {
                    isSuccess: false,
                    message: 'Notification already read',
                },
            };
        }

        return {
            event: NotificationsMessageSubscribe.MarkNotificationAsRead,
            data: {
                isSuccess: true,
                message: 'Mark notification as read successfully',
            },
        };
    }

    // Utils below

    /**
     * @description Authenticate client by jwt token
     * @param client Socket client
     * @returns ITokenVerifiedResponse | null
     */
    private async authenticateClient(client: Socket): Promise<ITokenVerifiedResponse> | null {
        let authHeaderParts = client.handshake?.headers?.authorization?.split(' ');
        if (!authHeaderParts) {
            authHeaderParts = client.handshake?.auth?.token?.split(' ');
        }
        if (authHeaderParts?.length !== 2) {
            return null;
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
            return null;
        }

        client.handshake.auth.user = userVerified;
        return userVerified;
    }
}
