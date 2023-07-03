import { UsersService } from '@app/resource';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { GetUsersDTO } from './dtos';
import { capitalize, isAdmin, isMod, isSuperAdmin, isUser } from '@app/common/utils';
import { RpcException } from '@nestjs/microservices';
import { BlockActivity } from '@app/resource/users/enums';

@Injectable()
export class UsersMntService {
    constructor(private readonly usersService: UsersService) {}

    async getUsers(payload: GetUsersDTO) {
        const {
            email,
            emailVerified,
            isBlocked,
            isDeleted,
            isVerified,
            role,
            search,
            status,
            limit = 10,
            offset = 0,
            order = 'asc',
            sort = 'createdAt',
        } = payload;
        const query: GetUsersDTO = {};

        if (email) {
            query.email = email;
        }

        if (typeof isBlocked !== 'undefined') {
            query.isBlocked = isBlocked;
        }

        if (typeof isDeleted !== 'undefined') {
            query.isDeleted = isDeleted;
        }

        if (typeof isVerified !== 'undefined') {
            query.isVerified = isVerified;
        }

        if (typeof emailVerified !== 'undefined') {
            query.emailVerified = emailVerified;
        }

        if (status) {
            query.status = status;
        }

        if (role) {
            query.role = capitalize(role);
        }

        if (search) {
            // Add any specific logic for search filtering, if needed
            // e.g., query.search = search;
        }

        return await this.usersService.getUsers(
            { role: query.role, ...query },
            { limit, offset, order, sort },
            ['-password'],
        );
    }

    async getUserById(id: string | Types.ObjectId | any) {
        try {
            const idSearch: Types.ObjectId = typeof id === 'string' ? new Types.ObjectId(id) : id;
            return await this.usersService.getUser({ _id: idSearch }, {}, ['-password']);
        } catch (error) {
            throw new RpcException(new BadRequestException('User Id is invalid'));
        }
    }

    async blockUser({
        victimUserId,
        blockUserId,
        blockReason,
        blockNote,
    }: {
        victimUserId: string;
        blockUserId: string;
        blockReason: string;
        blockNote: string;
    }) {
        if (victimUserId === blockUserId) {
            throw new RpcException(new BadRequestException('Cannot block yourself'));
        }

        const [victimUser, blockByUser] = await Promise.all([
            this.usersService.getUser({ _id: new Types.ObjectId(victimUserId) }),
            this.usersService.getUser({ _id: new Types.ObjectId(blockUserId) }),
        ]);

        if (victimUser.block && victimUser.block.isBlocked) {
            throw new RpcException(new BadRequestException('User is already blocked'));
        }

        if (isSuperAdmin(victimUser)) {
            throw new RpcException(new BadRequestException('Cannot block SuperAdmin'));
        }

        if (isAdmin(victimUser) && !isSuperAdmin(blockByUser)) {
            throw new RpcException(
                new BadRequestException('Cannot block Admin from other SuperAdmin'),
            );
        }

        if (isMod(victimUser) && !isSuperAdmin(blockByUser) && !isAdmin(blockByUser)) {
            throw new RpcException(
                new BadRequestException('Cannot block Mod from other Admin or SuperAdmin'),
            );
        }

        if (
            isUser(victimUser) &&
            !isSuperAdmin(blockByUser) &&
            !isAdmin(blockByUser) &&
            !isMod(blockByUser)
        ) {
            throw new RpcException(
                new BadRequestException('Cannot block User if not Admin or Mod'),
            );
        }

        if (isUser(blockByUser)) {
            throw new RpcException(new BadRequestException('User can not block other user'));
        }

        const actLogs = (victimUser.block && victimUser.block.activityLogs) || [];
        actLogs.push({
            activity: BlockActivity.Block,
            activityAt: new Date(),
            activityBy: blockUserId,
            activityReason: blockReason ? blockReason : '',
            activityNote: blockNote ? blockNote : '',
        });

        return await this.usersService.findOneAndUpdateUser(
            { _id: victimUserId },
            {
                block: {
                    isBlocked: true,
                    activityLogs: actLogs,
                },
            },
        );
    }

    async unblockUser({
        victimUserId,
        unblockUserId,
        unblockReason,
        unblockNote,
    }: {
        victimUserId: string;
        unblockUserId: string;
        unblockReason: string;
        unblockNote: string;
    }) {
        if (victimUserId === unblockUserId) {
            throw new RpcException(new BadRequestException('Cannot unblock yourself'));
        }

        const [victimUser, unblockByUser] = await Promise.all([
            this.usersService.getUser({ _id: new Types.ObjectId(victimUserId) }),
            this.usersService.getUser({ _id: new Types.ObjectId(unblockUserId) }),
        ]);

        if (victimUser.block && !victimUser.block.isBlocked) {
            throw new RpcException(new BadRequestException('User is not blocked'));
        }

        if (isSuperAdmin(victimUser)) {
            throw new RpcException(new BadRequestException('Cannot unblock SuperAdmin'));
        }

        if (isAdmin(victimUser) && !isSuperAdmin(unblockByUser)) {
            throw new RpcException(
                new BadRequestException('Cannot unblock Admin from other SuperAdmin'),
            );
        }

        if (isMod(victimUser) && !isSuperAdmin(unblockByUser) && !isAdmin(unblockByUser)) {
            throw new RpcException(
                new BadRequestException('Cannot unblock Mod from other Admin or SuperAdmin'),
            );
        }

        if (
            isUser(victimUser) &&
            !isSuperAdmin(unblockByUser) &&
            !isAdmin(unblockByUser) &&
            !isMod(unblockByUser)
        ) {
            throw new RpcException(
                new BadRequestException('Cannot unblock User if not Admin or Mod'),
            );
        }

        if (isUser(unblockByUser)) {
            throw new RpcException(new BadRequestException('User can not unblock other user'));
        }

        const actLogs = (victimUser.block && victimUser.block.activityLogs) || [];
        actLogs.push({
            activity: BlockActivity.Unblock,
            activityAt: new Date(),
            activityBy: unblockUserId,
            activityReason: unblockReason ? unblockReason : '',
            activityNote: unblockNote ? unblockNote : '',
        });

        return await this.usersService.findOneAndUpdateUser(
            { _id: victimUserId },
            {
                block: {
                    isBlocked: false,
                    activityLogs: actLogs,
                },
            },
        );
    }
}
