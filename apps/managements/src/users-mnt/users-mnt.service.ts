import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import {
    BlockUnblockRequestDTO,
    ChangeRoleRequestDTO,
    GetUsersDTO,
    QueryUserParamsDTO,
} from './dtos';
import { RpcException } from '@nestjs/microservices';
import { BlockActivity } from '@app/resource/users/enums';
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
        victimId,
        actorId,
        reason,
        note,
    }: BlockUnblockRequestDTO & { victimId: string; actorId: string }) {
        if (victimId === actorId) {
            throw new RpcException(new BadRequestException('Cannot block yourself'));
        }

        const [victimUser, blockByUser] = await Promise.all([
            this.usersService.getUser({ _id: new Types.ObjectId(victimId) }),
            this.usersService.getUser({ _id: new Types.ObjectId(actorId) }),
        ]);

        this.canBlockAndUnblockUser({
            victimUser,
            actorUser: blockByUser,
        });

        if (victimUser.block && victimUser.block.isBlocked) {
            throw new RpcException(new BadRequestException('User is already blocked'));
        }

        const actLogs = (victimUser.block && victimUser.block.activityLogs) || [];
        actLogs.push({
            activity: BlockActivity.Block,
            activityAt: new Date(),
            activityBy: actorId,
            activityReason: reason ? reason : '',
            activityNote: note ? note : '',
        });

        const [userReturn] = await Promise.all([
            this.usersService.findOneAndUpdateUser(
                { _id: victimId },
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
        victimId,
        actorId,
        reason,
        note,
    }: BlockUnblockRequestDTO & { victimId: string; actorId: string }) {
        if (victimId === actorId) {
            throw new RpcException(new BadRequestException('Cannot unblock yourself'));
        }

        const [victimUser, unblockByUser] = await Promise.all([
            this.usersService.getUser({ _id: new Types.ObjectId(victimId) }),
            this.usersService.getUser({ _id: new Types.ObjectId(actorId) }),
        ]);

        this.canBlockAndUnblockUser({
            victimUser,
            actorUser: unblockByUser,
        });

        if (victimUser.block && !victimUser.block.isBlocked) {
            throw new RpcException(new BadRequestException('User is not blocked'));
        }

        const actLogs = (victimUser.block && victimUser.block.activityLogs) || [];
        actLogs.push({
            activity: BlockActivity.Unblock,
            activityAt: new Date(),
            activityBy: actorId,
            activityReason: reason ? reason : '',
            activityNote: note ? note : '',
        });

        const [userReturn] = await Promise.all([
            this.usersService.findOneAndUpdateUser(
                { _id: victimId },
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
        role,
        victimId,
        actorId,
    }: ChangeRoleRequestDTO & {
        victimId: string;
        actorId: string;
    }) {
        const [user, updatedByUser] = await Promise.all([
            this.usersService.getUser({ _id: new Types.ObjectId(victimId) }),
            this.usersService.getUser({ _id: new Types.ObjectId(actorId) }),
        ]);

        this.canChangeRole({
            victimUser: user,
            actorUser: updatedByUser,
            roleToChange: role,
        });

        const [changeRole] = await Promise.all([
            this.usersService.findOneAndUpdateUser({ _id: victimId }, { role: role }),
            this.setUserRequiredRefresh({ user }),
            this.delCacheUsers(),
        ]);

        return changeRole;
    }
}
