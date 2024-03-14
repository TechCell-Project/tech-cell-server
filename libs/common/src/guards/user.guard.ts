import { CanActivate, Injectable } from '@nestjs/common';
import { UserRole } from '~libs/resource/users/enums';
import { AuthCoreGuard } from './auth.core.guard';
import { Reflector } from '@nestjs/core';

/**
 * @description UserGuard: required login for user role
 */
@Injectable()
export class UserGuard extends AuthCoreGuard implements CanActivate {
    constructor() {
        super(new Reflector(), UserGuard.name);
        this._acceptRoles.push(UserRole.User);
    }
}
