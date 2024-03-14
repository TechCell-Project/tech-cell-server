import { CanActivate, Injectable } from '@nestjs/common';
import { AuthCoreGuard } from './auth.core.guard';
import { UserRole } from '~libs/resource/users/enums';
import { Reflector } from '@nestjs/core';

/**
 * @description ManagerGuard: required login for manager role (highest role)
 */
@Injectable()
export class ManagerGuard extends AuthCoreGuard implements CanActivate {
    constructor() {
        super(new Reflector(), ManagerGuard.name);
        this._acceptRoles.push(UserRole.Manager);
    }
}
