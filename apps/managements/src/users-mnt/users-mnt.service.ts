import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import {
    BlockUnblockRequestDTO,
    ChangeRoleRequestDTO,
    CreateUserRequestDto,
    UpdateUserAddressRequestDTO,
    UpdateUserExecDTO,
    UpdateUserRequestDTO,
} from './dtos';
import { RpcException } from '@nestjs/microservices';
import { BlockActivity, UserRole } from '~libs/resource/users/enums';
import { UsersMntUtilService } from './users-mnt.util.service';
import { generateRandomString } from '~libs/common';
import { AddressSchemaDTO, CreateUserDTO, ImageSchemaDTO } from '~libs/resource/users/dtos';
import { USERS_CACHE_PREFIX } from '~libs/common/constants';
import { cleanUserBeforeResponse } from '~libs/resource/users/utils';
import { TCurrentUser } from '~libs/common/types';
import { UsersService } from '~libs/resource/users';
import { CloudinaryService } from '~libs/third-party/cloudinary.com';
import { UsersMntExceptions } from './users-mnt.exception';
import { RedisService } from '~libs/common/Redis/services';

@Injectable()
export class UsersMntService extends UsersMntUtilService {
    protected readonly logger = new Logger(UsersMntService.name);
    constructor(
        protected readonly usersService: UsersService,
        protected redisService: RedisService,
        private readonly cloudinaryService: CloudinaryService,
    ) {
        super(usersService, redisService);
        this.logger = new Logger(UsersMntService.name);
    }

    async createUser({ ...createUserRequestDto }: CreateUserRequestDto) {
        const newUser = new CreateUserDTO(createUserRequestDto);

        if (createUserRequestDto.role === UserRole.SuperAdmin) {
            throw new RpcException(UsersMntExceptions.cantCreateSuperAdmin);
        }

        const [userCreated] = await Promise.all([
            this.usersService.createUser(newUser),
            this.redisService.delWithPrefix(USERS_CACHE_PREFIX), // remove users cache
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
            throw new RpcException(UsersMntExceptions.cantBlockYourself);
        }

        const [victimUser, blockByUser] = await Promise.all([
            this.usersService.getUser({ _id: new Types.ObjectId(victimId) }),
            this.usersService.getUser({ _id: new Types.ObjectId(actorId) }),
        ]);

        this.canBlockAndUnblockUser({
            victimUser,
            actorUser: blockByUser,
            action: 'block',
        });

        if (victimUser.block && victimUser?.block?.isBlocked) {
            throw new RpcException(UsersMntExceptions.userAlreadyBlocked);
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
            this.redisService.delWithPrefix(USERS_CACHE_PREFIX),
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
            throw new RpcException(UsersMntExceptions.cantUnblockYourself);
        }

        const [victimUser, unblockByUser] = await Promise.all([
            this.usersService.getUser({ _id: new Types.ObjectId(victimId) }),
            this.usersService.getUser({ _id: new Types.ObjectId(actorId) }),
        ]);

        this.canBlockAndUnblockUser({
            victimUser,
            actorUser: unblockByUser,
            action: 'unblock',
        });

        if (victimUser.block && !victimUser.block.isBlocked) {
            throw new RpcException(UsersMntExceptions.userAlreadyUnblocked);
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
            this.redisService.delWithPrefix(USERS_CACHE_PREFIX),
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
            this.redisService.delWithPrefix(USERS_CACHE_PREFIX),
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
            this.logger.error(error);
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
        this.logger.debug(dataUpdate);
        const oldUser = await this.usersService.getUser({ _id: new Types.ObjectId(user._id) });
        delete oldUser.createdAt;
        delete oldUser.updatedAt;

        let imageCloud = null;

        if (dataUpdate?.userName) {
            const isUsernameExist = await this.usersService.isUserNameExist(dataUpdate.userName);
            if (isUsernameExist) {
                throw new RpcException(UsersMntExceptions.userNameIsAlreadyExist);
            }
        }

        if (dataUpdate?.avatarPublicId) {
            try {
                const res = await this.cloudinaryService.getImageByPublicId(
                    dataUpdate.avatarPublicId,
                );
                imageCloud = new ImageSchemaDTO({
                    publicId: res.public_id,
                    url: res.secure_url,
                });
            } catch (error) {
                delete dataUpdate.avatarPublicId;
                imageCloud = null;
                throw new RpcException(UsersMntExceptions.avatarIsNotfound);
            }
        }

        const newUser = {
            ...oldUser,
            ...new UpdateUserExecDTO({
                ...dataUpdate,
                ...(imageCloud ? { avatar: imageCloud } : {}),
            }),
        };
        const userUpdated = await this.usersService.findOneAndUpdateUser(
            { _id: user._id },
            newUser,
        );

        return {
            message: 'Update user info success',
            data: cleanUserBeforeResponse(userUpdated),
        };
    }

    async updateUserAddress({
        user,
        addressData,
    }: {
        user: TCurrentUser;
        addressData: UpdateUserAddressRequestDTO;
    }) {
        const userFound = await this.usersService.getUser({ _id: new Types.ObjectId(user._id) });
        const newAddr = Array.isArray(addressData.address)
            ? addressData.address.map((addr) => {
                  if (!addr?.customerName) {
                      addr.customerName = userFound.firstName + ' ' + userFound.lastName;
                  }
                  return new AddressSchemaDTO(addr);
              })
            : [];

        if (newAddr.length > 0 && !newAddr.find((a) => a?.isDefault)) {
            Object.assign(newAddr[0], {
                isDefault: true,
            });
        }

        if (newAddr.length > 0 && newAddr.filter((a) => a?.isDefault).length > 1) {
            throw new RpcException(UsersMntExceptions.onlyOneAddressIsDefault);
        }

        userFound.address = newAddr;
        const userUpdated = await this.usersService.findOneAndUpdateUser(
            { _id: userFound._id },
            userFound,
        );
        return {
            message: 'Update address success',
            data: cleanUserBeforeResponse(userUpdated),
        };
    }
}
