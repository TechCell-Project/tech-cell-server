import { UsersService } from '@app/resource';
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { isAdmin, isMod, isSuperAdmin, isUser } from '@app/common/utils';
import { RpcException } from '@nestjs/microservices';
import { BlockActivity, CommonActivity } from '@app/resource/users/enums';
import { User } from '@app/resource/users/schemas';

@Injectable()
export class UsersMntUtilService {
    constructor(protected readonly usersService: UsersService) {}

    /**
     * Verify the permission of the actor user to perform the action on the victim user
     * @param - { victimUser, actorUser, actions}
     * @returns return true if permission is granted, otherwise throw an error
     */
    protected async verifyPermission({
        victimUser,
        actorUser,
        actions,
    }: {
        victimUser: User;
        actorUser: User;
        actions: string;
    }) {
        switch (actions) {
            case BlockActivity.Block:
            case BlockActivity.Unblock:
                return this.canBlockAndUnblockUser({ victimUser, actorUser });
            case CommonActivity.ChangeRole:
                return this.canChangeRole({ victimUser, actorUser });
            default:
                throw new RpcException(new BadRequestException('Invalid action'));
        }
    }

    private canBlockAndUnblockUser({
        victimUser,
        actorUser,
    }: {
        victimUser: User;
        actorUser: User;
    }) {
        if (victimUser._id.toString() === actorUser._id.toString()) {
            throw new BadRequestException('You cannot block yourself');
        }

        if (!this.requiredHigherRole({ victimUser, actorUser })) {
            throw new BadRequestException('You cannot block this user');
        }

        return true;
    }

    private canChangeRole({ victimUser, actorUser }: { victimUser: User; actorUser: User }) {
        if (victimUser._id.toString() === actorUser._id.toString()) {
            throw new BadRequestException('You cannot change your role');
        }

        // Actor's role must be higher than victim's role
        if (!this.requiredHigherRole({ victimUser, actorUser })) {
            throw new RpcException(new ForbiddenException('You cannot change this user role'));
        }

        // Actor user must be admin or higher role to change other user role
        if (!this.requiredAdminOrHigherRole({ actorUser })) {
            throw new RpcException(new ForbiddenException('You cannot change this user role'));
        }

        // Victim user must not be Super Admin
        if (this.requiredSuperAdminRole({ actorUser: victimUser })) {
            throw new RpcException(new ForbiddenException('You cannot change this user role'));
        }

        return true;
    }

    private requiredHigherRole({ victimUser, actorUser }: { victimUser: User; actorUser: User }) {
        if (isSuperAdmin(victimUser)) {
            return false;
        }

        if (isUser(actorUser)) {
            return false;
        }

        if (isAdmin(victimUser) && !isSuperAdmin(actorUser)) {
            return false;
        }

        if (isMod(victimUser) && !isSuperAdmin(actorUser) && !isAdmin(actorUser)) {
            return false;
        }

        if (
            isUser(victimUser) &&
            !isSuperAdmin(actorUser) &&
            !isAdmin(actorUser) &&
            !isMod(actorUser)
        ) {
            return false;
        }

        return true;
    }

    private requiredAdminOrHigherRole({ actorUser }: { actorUser: User }) {
        if (!isAdmin(actorUser) && !isSuperAdmin(actorUser)) {
            return false;
        }

        return true;
    }

    private requiredSuperAdminRole({ actorUser }: { actorUser: User }) {
        if (!isSuperAdmin(actorUser)) {
            return false;
        }

        return true;
    }
}
