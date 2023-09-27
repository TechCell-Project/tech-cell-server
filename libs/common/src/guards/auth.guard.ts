import { Injectable } from '@nestjs/common';
import { UserRole } from '@app/resource/users/enums';
import { AuthCoreGuard } from './auth.core.guard';
import { Reflector } from '@nestjs/core';

/**
 * @description AuthGuard: required login for all user roles
 */
@Injectable()
export class AuthGuard extends AuthCoreGuard {
    constructor() {
        super(new Reflector(), AuthGuard.name);
        this._acceptRoles.push(UserRole.SuperAdmin, UserRole.Admin, UserRole.Mod, UserRole.User);
    }
}
