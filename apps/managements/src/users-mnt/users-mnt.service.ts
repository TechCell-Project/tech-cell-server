import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { BlockUnblockRequestDTO, ChangeRoleRequestDTO, CreateUserRequestDto } from './dtos';
import { RpcException } from '@nestjs/microservices';
import { BlockActivity, UserRole } from '@app/resource/users/enums';
import { UsersMntUtilService } from './users-mnt.util.service';
import { delStartWith, generateRandomString } from '@app/common';
import { CreateUserDTO } from '@app/resource/users/dtos';
import { USERS_CACHE_PREFIX } from '~/constants';
import { delCacheUsers } from '@app/resource/users/utils';

@Injectable()
export class UsersMntService extends UsersMntUtilService {
    async createUser({ ...createUserRequestDto }: CreateUserRequestDto) {
        const newUser = createUserRequestDto;

        if (createUserRequestDto.role === UserRole.SuperAdmin) {
            throw new RpcException(new BadRequestException('Cannot create Super Admin'));
        }

        if (!createUserRequestDto.firstName) {
            Object.assign(newUser, { firstName: `systemF` });
        }

        if (!createUserRequestDto.lastName) {
            Object.assign(newUser, { lastName: `systemL` });
        }

        if (!createUserRequestDto.email) {
            Object.assign(newUser, { email: `${newUser.userName}_account@techcell.cloud` });
            Object.assign(newUser, { emailVerified: true });
        }

        const [userCreated] = await Promise.all([
            this.usersService.createUser(newUser as CreateUserDTO),
            delStartWith(USERS_CACHE_PREFIX, this.cacheManager), // remove users cache
        ]);

        return userCreated;
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

        if (victimUser.block && victimUser?.block?.isBlocked) {
            throw new RpcException(new BadRequestException('User is already blocked'));
        }

        const actLogs = (victimUser.block && victimUser?.block?.activityLogs) || [];
        actLogs.push({
            activity: BlockActivity.Block,
            activityAt: new Date(),
            activityBy: actorId,
            activityReason: reason ?? '',
            activityNote: note ?? '',
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
            delCacheUsers(this.cacheManager),
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

        const actLogs = (victimUser.block && victimUser?.block?.activityLogs) || [];
        actLogs.push({
            activity: BlockActivity.Unblock,
            activityAt: new Date(),
            activityBy: actorId,
            activityReason: reason ?? '',
            activityNote: note ?? '',
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
            delCacheUsers(this.cacheManager),
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
            delCacheUsers(this.cacheManager),
        ]);

        return changeRole;
    }

    async generateUsers(num = 1) {
        try {
            const users = [];
            for (let i = 0; i < num; i++) {
                const ran = `user_clone_${generateRandomString(4)}_${i}`;
                users.push(
                    this.createUser({
                        userName: ran,
                        password: ran,
                        role: UserRole.User,
                    }),
                );
            }

            await Promise.all(users);
            return {
                message: `Generate ${num} users success`,
            };
        } catch (error) {
            Logger.error(error);
            throw new RpcException(new BadRequestException(error.message));
        }
    }
}
