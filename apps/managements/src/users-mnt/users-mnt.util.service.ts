import { UsersService } from '~libs/resource';
import { Injectable, Logger } from '@nestjs/common';
import { isAdmin, isSuperAdmin, isUser } from '~libs/common/utils';
import { RpcException } from '@nestjs/microservices';
import { User } from '~libs/resource/users/schemas';
import { REQUIRE_USER_REFRESH } from '~libs/common/constants';
import { UserRole } from '~libs/resource/users/enums';
import { convertTimeString } from 'convert-time-string';
import { UsersMntExceptions } from './users-mnt.exception';
import { RedisService } from '~libs/common/Redis/services';

@Injectable()
export class UsersMntUtilService {
    protected readonly logger: Logger;

    constructor(
        protected readonly usersService: UsersService,
        protected redisService: RedisService,
    ) {
        this.logger = new Logger(UsersMntUtilService.name);
    }

    /**
     * After update user, set user to cache to require user refresh their token
     * @param param0 - { user } - user to be set to cache
     * @returns return true if set successfully, otherwise throw an error
     * @example
     * REQUIRE_USER_REFRESH_{userId}
     *
     */
    protected async setUserRequiredRefresh({ user }: { user: User }) {
        await this.redisService.set(
            `${REQUIRE_USER_REFRESH}_${user._id}`,
            true,
            convertTimeString(process.env.JWT_ACCESS_TOKEN_EXPIRE_TIME_STRING),
        );
        return true;
    }

    /**
     * Check if actorUser can block or unblock victimUser
     * @param param0 - { victimUser, actorUser } - victimUser is the user to be blocked, actorUser is the user who block victimUser
     * @returns return true if actorUser can block victimUser, otherwise throw an error
     */
    protected canBlockAndUnblockUser({
        victimUser,
        actorUser,
        action,
    }: {
        victimUser: User;
        actorUser: User;
        action: 'block' | 'unblock';
    }) {
        if (victimUser._id.toString() === actorUser._id.toString()) {
            if (action === 'block') {
                throw new RpcException(UsersMntExceptions.cantBlockYourself);
            } else {
                throw new RpcException(UsersMntExceptions.cantUnblockYourself);
            }
        }

        if (!this.requiredHigherRole({ victimUser, actorUser })) {
            if (action === 'block') {
                throw new RpcException(UsersMntExceptions.cantBlockThisUser);
            } else {
                throw new RpcException(UsersMntExceptions.cantUnblockThisUser);
            }
        }

        return true;
    }

    /**
     * Check if actorUser can change victimUser role
     * @param param0 - { victimUser, actorUser } - victimUser is the user to be changed role, actorUser is the user who change victimUser role
     * @returns return true if actorUser can change victimUser role, otherwise throw an error
     */
    protected canChangeRole({
        victimUser,
        actorUser,
        roleToChange,
    }: {
        victimUser: User;
        actorUser: User;
        roleToChange: string;
    }) {
        if (!isSuperAdmin(actorUser) && !isAdmin(actorUser)) {
            throw new RpcException(UsersMntExceptions.notHavePermissionToChangeRole);
        }

        if (victimUser._id.toString() === actorUser._id.toString()) {
            throw new RpcException(UsersMntExceptions.cantChangeYourOwnRole);
        }

        if (isSuperAdmin(victimUser) && !isSuperAdmin(actorUser)) {
            throw new RpcException(UsersMntExceptions.cantChangeSuperAdminRole);
        }

        if (roleToChange === UserRole.Manager) {
            throw new RpcException(UsersMntExceptions.cantGrantSuperAdminRole);
        }

        if (actorUser.role === UserRole.Staff && roleToChange === UserRole.Staff) {
            throw new RpcException(UsersMntExceptions.notHavePermissionToGrantAdminRole);
        }

        return true;
    }

    /**
     * Check if actorUser is higher role than victimUser
     * @param param0 - { victimUser, actorUser } - victimUser is the user to be blocked, actorUser is the user who block victimUser
     * @returns return true if actorUser is higher role than victimUser, otherwise return false
     */
    private requiredHigherRole({ victimUser, actorUser }: { victimUser: User; actorUser: User }) {
        if (isUser(actorUser)) {
            return false;
        }

        if (isSuperAdmin(victimUser)) {
            return false;
        }

        if (isAdmin(victimUser) && !isSuperAdmin(actorUser)) {
            return false;
        }

        if (!isSuperAdmin(actorUser) && !isAdmin(actorUser)) {
            return false;
        }

        if (isUser(victimUser) && !isSuperAdmin(actorUser) && !isAdmin(actorUser)) {
            return false;
        }

        return true;
    }

    /**
     * Check if actorUser is Admin or Super Admin
     * @param param0 actorUser
     * @returns return true if actorUser is Admin or Super Admin, otherwise return false
     */
    private requiredAdminOrHigherRole({ actorUser }: { actorUser: User }) {
        if (!isAdmin(actorUser) && !isSuperAdmin(actorUser)) {
            return false;
        }

        return true;
    }

    /**
     * Check if actorUser is Super Admin
     * @param param0 actorUser
     * @returns return true if actorUser is Super Admin, otherwise return false
     */
    private requiredSuperAdminRole({ actorUser }: { actorUser: User }) {
        if (!isSuperAdmin(actorUser)) {
            return false;
        }

        return true;
    }
}
