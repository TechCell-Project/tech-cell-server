import {
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
    MessageBody,
    SubscribeMessage,
    WsResponse,
    ConnectedSocket,
} from '@nestjs/websockets';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { NotificationsMessageSubscribe } from '../constants/notifications.message';
import { Logger } from '@nestjs/common';
import { ClientRMQ, RmqRecordBuilder } from '@nestjs/microservices';
import { ITokenVerifiedResponse } from '~apps/auth/interfaces';
import { AuthMessagePattern } from '~apps/auth/auth.pattern';
import { UserRole } from '~libs/resource/users/enums';
import { NotifyRoom } from '../constants/notifications.constant';
import { NotificationService } from '~libs/resource';
import { Types } from 'mongoose';
import { instrument, RedisStore } from '@socket.io/admin-ui';
import { RedisService } from '~libs/common/Redis/services/redis.service';
import { AuthCoreGuard } from '~libs/common/guards/auth.core.guard';

@WebSocketGateway({
    cors: {
        origin: process.env.SOCKET_CORS_HOST?.split(',')?.map((host) => host?.trim()),
        credentials: true,
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
        protected readonly redisService: RedisService,
    ) {}

    @WebSocketServer()
    readonly server: Server;

    async afterInit() {
        this.logger.debug('Notification gateway initialized');
        this.connectedClients = new Map<string, Socket>();
        instrument(this.server, {
            mode: 'development',
            auth: {
                type: 'basic',
                username: process.env.SOCKET_ADMIN_USER,
                password: process.env.SOCKET_ADMIN_PASSWORD,
            },
            store: new RedisStore(this.redisService.getClient()),
        });
    }

    /**
     * @description Handle connection from client and join to room base on user role and user id
     */
    async handleConnection(client: Socket) {
        const userVerified: ITokenVerifiedResponse | null = await this.authenticateClient(client);
        if (!userVerified) {
            this.logger.debug(`Client ${client.id} connected to server as guest`);
            return;
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

        this.logger.debug(`Client ${client.id} connected to ${rooms.join(', ')}`);
        this.connectedClients.set(client.id, client);
        return client.join(rooms);
    }

    /**
     * @description Handle disconnect from client
     */
    async handleDisconnect(client: Socket) {
        this.logger.debug(`Client ${client.id} disconnected`);
        this.connectedClients.delete(client.id);
    }

    @SubscribeMessage(NotificationsMessageSubscribe.MarkNotificationAsRead)
    async markNotificationAsRead(
        @ConnectedSocket() client: Socket,
        @MessageBody() { notificationId }: { notificationId: string },
    ): Promise<
        WsResponse<{
            isSuccess: boolean;
            message: string;
        }>
    > {
        this.logger.debug(`Client ${client.id} called mark notification as read`);
        if (!client.handshake.auth.user) {
            this.logger.debug(`Client ${client.id} is not authenticated`);
            return {
                event: NotificationsMessageSubscribe.MarkNotificationAsRead,
                data: {
                    isSuccess: false,
                    message: 'Unauthorized',
                },
            };
        }

        if (!notificationId) {
            this.logger.debug(`Client ${client.id} notification id is required`);
            return {
                event: NotificationsMessageSubscribe.MarkNotificationAsRead,
                data: {
                    isSuccess: false,
                    message: 'Notification id is required',
                },
            };
        }

        if (!Types.ObjectId.isValid(notificationId)) {
            this.logger.debug(`Client ${client.id} notification id is invalid`);
            return {
                event: NotificationsMessageSubscribe.MarkNotificationAsRead,
                data: {
                    isSuccess: false,
                    message: 'Notification id is invalid',
                },
            };
        }

        const notification = await this.notificationService.markNotificationAsRead({
            _id: new Types.ObjectId(notificationId),
            recipientId: new Types.ObjectId(client.handshake.auth.user._id),
        });
        if (notification === null) {
            this.logger.debug(`Client ${client.id} notification not found`);
            return {
                event: NotificationsMessageSubscribe.MarkNotificationAsRead,
                data: {
                    isSuccess: false,
                    message: 'Notification not found',
                },
            };
        }

        if (notification === false) {
            this.logger.debug(`Client ${client.id} notification already read`);
            return {
                event: NotificationsMessageSubscribe.MarkNotificationAsRead,
                data: {
                    isSuccess: false,
                    message: 'Notification already read',
                },
            };
        }

        this.logger.debug(`Client ${client.id} mark notification as read successfully`);
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
    private async authenticateClient(
        client: Socket,
        guard?: AuthCoreGuard,
    ): Promise<ITokenVerifiedResponse> | null {
        let authHeaderParts = client.handshake?.headers?.authorization?.split(' ');
        if (!authHeaderParts) {
            authHeaderParts = client.handshake?.auth?.token?.split(' ');
        }
        if (authHeaderParts?.length !== 2) {
            return null;
        }
        const [, jwt] = authHeaderParts;
        const record = new RmqRecordBuilder()
            .setOptions({
                headers: {
                    'x-lang': 'en',
                },
            })
            .setData({ jwt })
            .build();
        const userVerified: ITokenVerifiedResponse = await firstValueFrom(
            this.authService.send(AuthMessagePattern.verifyJwt, record).pipe(
                catchError(() => {
                    return of(null);
                }),
            ),
        );

        if (!userVerified) {
            return null;
        }

        if (guard && !guard._acceptRoles.includes(userVerified.role)) {
            return null;
        }

        client.handshake.auth.user = userVerified;
        return userVerified;
    }
}
