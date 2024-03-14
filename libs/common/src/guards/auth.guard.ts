import { CanActivate, Injectable } from '@nestjs/common';
import { UserRole } from '~libs/resource/users/enums';
import { AuthCoreGuard } from './auth.core.guard';
import { Reflector } from '@nestjs/core';

/**
 * @description AuthGuard: required login for all user roles
 */
@Injectable()
export class AuthGuard extends AuthCoreGuard implements CanActivate {
    constructor() {
        super(new Reflector(), AuthGuard.name);
        this._acceptRoles.push(UserRole.Manager, UserRole.Staff, UserRole.User);
    }
}
