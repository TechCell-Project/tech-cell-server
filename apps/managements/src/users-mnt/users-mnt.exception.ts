import { HttpException, HttpStatus } from '@nestjs/common';

class UsersMntException extends HttpException {
    constructor(errorCode: string, message: string, statusCode: HttpStatus) {
        super(
            {
                errorCode,
                message,
                statusCode,
            },
            statusCode,
        );
    }
}

export const UsersMntExceptions = {
    cantCreateSuperAdmin: new UsersMntException(
        'USERS_MNT_CANT_CREATE_SUPER_ADMIN',
        'Cannot create Super Admin',
        HttpStatus.BAD_REQUEST,
    ),
    cantBlockYourself: new UsersMntException(
        'USERS_MNT_CANT_BLOCK_YOURSELF',
        'Cannot block yourself',
        HttpStatus.BAD_REQUEST,
    ),
    cantBlockThisUser: new UsersMntException(
        'USERS_MNT_CANT_BLOCK_THIS_USER',
        'Cannot block this user',
        HttpStatus.BAD_REQUEST,
    ),
    userAlreadyBlocked: new UsersMntException(
        'USERS_MNT_USER_ALREADY_BLOCKED',
        'User is already blocked',
        HttpStatus.BAD_REQUEST,
    ),
    cantUnblockYourself: new UsersMntException(
        'USERS_MNT_CANT_UNBLOCK_YOURSELF',
        'Cannot unblock yourself',
        HttpStatus.BAD_REQUEST,
    ),
    cantUnblockThisUser: new UsersMntException(
        'USERS_MNT_CANT_UNBLOCK_THIS_USER',
        'Cannot unblock this user',
        HttpStatus.BAD_REQUEST,
    ),
    userAlreadyUnblocked: new UsersMntException(
        'USERS_MNT_USER_ALREADY_UNBLOCKED',
        'User is already unblocked',
        HttpStatus.BAD_REQUEST,
    ),
    userNameIsAlreadyExist: new UsersMntException(
        'USERS_MNT_USERNAME_IS_ALREADY_EXIST',
        'Username is already exist',
        HttpStatus.BAD_REQUEST,
    ),
    avatarIsNotfound: new UsersMntException(
        'USERS_MNT_AVATAR_IS_NOT_FOUND',
        'Avatar is not found',
        HttpStatus.BAD_REQUEST,
    ),
    onlyOneAddressIsDefault: new UsersMntException(
        'USERS_MNT_ONLY_ONE_ADDRESS_IS_DEFAULT',
        'Only one address is default',
        HttpStatus.BAD_REQUEST,
    ),
    notHavePermissionToChangeRole: new UsersMntException(
        'USERS_MNT_NOT_HAVE_PERMISSION_TO_CHANGE_ROLE',
        'You do not have permission to change roles',
        HttpStatus.FORBIDDEN,
    ),
    cantChangeYourOwnRole: new UsersMntException(
        'USERS_MNT_CANT_CHANGE_YOUR_OWN_ROLE',
        'You cannot change your own role',
        HttpStatus.BAD_REQUEST,
    ),
    cantChangeSuperAdminRole: new UsersMntException(
        'USERS_MNT_CANT_CHANGE_SUPER_ADMIN_ROLE',
        'You cannot change Super Admin role',
        HttpStatus.BAD_REQUEST,
    ),
    cantGrantSuperAdminRole: new UsersMntException(
        'USERS_MNT_CANT_GRANT_SUPER_ADMIN_ROLE',
        'You cannot grant Super Admin role',
        HttpStatus.BAD_REQUEST,
    ),
    notHavePermissionToGrantAdminRole: new UsersMntException(
        'USERS_MNT_NOT_HAVE_PERMISSION_TO_GRANT_ADMIN_ROLE',
        'You do not have permission to grant Admin role',
        HttpStatus.FORBIDDEN,
    ),
};
