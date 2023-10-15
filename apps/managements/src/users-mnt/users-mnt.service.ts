import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import {
    BlockUnblockRequestDTO,
    ChangeRoleRequestDTO,
    CreateUserRequestDto,
    UpdateUserRequestDTO,
} from './dtos';
import { RpcException } from '@nestjs/microservices';
import { BlockActivity, UserRole } from '@app/resource/users/enums';
import { UsersMntUtilService } from './users-mnt.util.service';
import { delStartWith, generateRandomString } from '@app/common';
import { CreateUserDTO } from '@app/resource/users/dtos';
import { REDIS_CACHE, USERS_CACHE_PREFIX } from '~/constants';
import { delCacheUsers } from '@app/resource/users/utils';
import { TCurrentUser } from '@app/common/types';
import { UsersService } from '@app/resource/users';
import { Store } from 'cache-manager';
import { CloudinaryService } from '@app/third-party/cloudinary.com';

@Injectable()
export class UsersMntService extends UsersMntUtilService {
    protected readonly logger: Logger;
    constructor(
        protected readonly usersService: UsersService,
        @Inject(REDIS_CACHE) protected cacheManager: Store,
        private readonly cloudinaryService: CloudinaryService,
    ) {
        super(usersService, cacheManager);
        this.logger = new Logger(UsersMntService.name);
    }

    async createUser({ ...createUserRequestDto }: CreateUserRequestDto) {
        const newUser = new CreateUserDTO(createUserRequestDto);

        if (createUserRequestDto.role === UserRole.SuperAdmin) {
            throw new RpcException(new BadRequestException('Cannot create Super Admin'));
        }

        const [userCreated] = await Promise.all([
            this.usersService.createUser(newUser),
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

    async updateUserInfo({
        user,
        dataUpdate,
    }: {
        user: TCurrentUser;
        dataUpdate: UpdateUserRequestDTO;
    }) {
        const oldUser = await this.usersService.getUser({ _id: new Types.ObjectId(user._id) });
        delete oldUser.createdAt;
        delete oldUser.updatedAt;

        if (dataUpdate?.userName) {
            const user = await this.usersService.getUser({ userName: dataUpdate.userName });
            if (user) {
                throw new RpcException(new BadRequestException('Username already exists'));
            }
        }

        if (dataUpdate?.avatar) {
            try {
                const avatarUrl = (
                    await this.cloudinaryService.getImageByPublicId(dataUpdate.avatar)
                ).secure_url;
                dataUpdate.avatar = avatarUrl;
            } catch (error) {
                delete dataUpdate.avatar;
                throw new RpcException(new BadRequestException('Avatar not found'));
            }
        }

        const newUser = { ...oldUser, ...new UpdateUserRequestDTO(dataUpdate) };
        const userUpdated = await this.usersService.findOneAndUpdateUser(
            { _id: user._id },
            newUser,
        );
        return userUpdated;
    }
}
