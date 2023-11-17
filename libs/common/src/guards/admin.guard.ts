import { CanActivate, Injectable } from '@nestjs/common';
import { UserRole } from '~libs/resource/users/enums';
import { AuthCoreGuard } from './auth.core.guard';
import { Reflector } from '@nestjs/core';

/**
 * @description AdminGuard: required login for admin or higher roles
 */
@Injectable()
export class AdminGuard extends AuthCoreGuard implements CanActivate {
    constructor() {
        super(new Reflector(), AdminGuard.name);
        this._acceptRoles.push(UserRole.SuperAdmin, UserRole.Admin);
    }
}
