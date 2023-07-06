import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { GetUsersDTO, QueryUserParamsDTO } from './dtos';
import { capitalize } from '@app/common/utils';
import { RpcException } from '@nestjs/microservices';
import { BlockActivity, CommonActivity, UserRole } from '@app/resource/users/enums';
import { UsersMntUtilService } from './users-mnt.util.service';

@Injectable()
export class UsersMntService extends UsersMntUtilService {
    async getUsers(payload: QueryUserParamsDTO) {
        // TODO: Refactor this search query
        const {
            emailVerified,
            isBlocked,
            // isDeleted,
            isVerified,
            role,
            search,
            status,
            limit = 10,
            offset = 0,
            order = 'asc',
            sort = 'createdAt',
            all = false,
        } = payload;
        const query: GetUsersDTO = {};

        if (typeof isBlocked !== 'undefined') {
            query.block.isBlocked = isBlocked;
        }

        // if (typeof isDeleted !== 'undefined') {
        //     query.isDeleted = isDeleted;
        // }

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
            // TODO: Add any specific logic for search filtering, if needed
            // Add any specific logic for search filtering, if needed
            // e.g., query.search = search;
        }

        if (all) {
            return await this.usersService.getUsers({}, {}, ['-password']);
        }

        return await this.usersService.getUsers({ ...query }, { limit, offset, order, sort }, [
            '-password',
        ]);
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

        if (
            !this.verifyPermission({
                victimUser,
                actorUser: blockByUser,
                actions: BlockActivity.Block,
            })
        ) {
            throw new RpcException(
                new ForbiddenException('You do not have permission to block this user'),
            );
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

        if (
            !this.verifyPermission({
                victimUser,
                actorUser: unblockByUser,
                actions: BlockActivity.Block,
            })
        ) {
            throw new RpcException(
                new ForbiddenException('You do not have permission to unblock this user'),
            );
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

    async updateRole({
        victimId,
        role,
        actorId,
    }: {
        victimId: string;
        role: string;
        actorId: string;
    }) {
        const [user, updatedByUser] = await Promise.all([
            this.usersService.getUser({ _id: new Types.ObjectId(victimId) }),
            this.usersService.getUser({ _id: new Types.ObjectId(actorId) }),
        ]);

        if (role.toLowerCase() === UserRole.SuperAdmin.toLowerCase()) {
            throw new RpcException(
                new BadRequestException('You cannot grant Super Admin role to anyone'),
            );
        }

        await this.verifyPermission({
            victimUser: user,
            actorUser: updatedByUser,
            actions: CommonActivity.ChangeRole,
        });

        const [changeRole] = await Promise.all([
            this.usersService.findOneAndUpdateUser({ _id: victimId }, { role: role }),
            this.setUserToCache({ user }),
        ]);

        return changeRole;
    }
}
