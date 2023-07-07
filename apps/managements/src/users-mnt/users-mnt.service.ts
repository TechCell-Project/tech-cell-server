import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { GetUsersDTO, QueryUserParamsDTO } from './dtos';
import { RpcException } from '@nestjs/microservices';
import { BlockActivity, CommonActivity, UserRole } from '@app/resource/users/enums';
import { UsersMntUtilService } from './users-mnt.util.service';
import { timeStringToMs } from '@app/common';

@Injectable()
export class UsersMntService extends UsersMntUtilService {
    async getUsers(payload: QueryUserParamsDTO) {
        const { all, limit = 1, offset = 0 } = payload;

        const query: GetUsersDTO = {};
        const options = { limit, skip: offset };

        const cacheKey = this.buildCacheKeyUsers({ limit, offset, all });
        const usersFromCache = await this.cacheManager.get(cacheKey);
        if (usersFromCache) {
            Logger.log(`CACHE HIT: ${cacheKey}`);
            return usersFromCache;
        }

        if (all) {
            delete options.limit;
            delete options.skip;
        }

        Logger.warn(`CACHE MISS: ${cacheKey}`);
        const usersFromDb = await this.usersService.getUsers({ ...query }, { ...options }, [
            '-password',
        ]);

        await this.cacheManager.set(cacheKey, usersFromDb, timeStringToMs('1h'));

        return usersFromDb;
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

        const [userReturn] = await Promise.all([
            this.usersService.findOneAndUpdateUser(
                { _id: victimUserId },
                {
                    block: {
                        isBlocked: true,
                        activityLogs: actLogs,
                    },
                },
            ),
            this.setUserRequiredRefresh({ user: victimUser }),
            this.delCacheUsers(),
        ]);

        return userReturn;
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

        const [userReturn] = await Promise.all([
            this.usersService.findOneAndUpdateUser(
                { _id: victimUserId },
                {
                    block: {
                        isBlocked: false,
                        activityLogs: actLogs,
                    },
                },
            ),
            this.setUserRequiredRefresh({ user: victimUser }),
            this.delCacheUsers(),
        ]);

        return userReturn;
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
            this.setUserRequiredRefresh({ user }),
            this.delCacheUsers(),
        ]);

        return changeRole;
    }
}
