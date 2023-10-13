import { Injectable } from '@nestjs/common';
import { AuthCoreGuard } from './auth.core.guard';
import { UserRole } from '@app/resource/users/enums';
import { Reflector } from '@nestjs/core';

/**
 * @description SuperAdminGuard: required login for super admin role (highest role)
 */
@Injectable()
export class SuperAdminGuard extends AuthCoreGuard {
    constructor() {
        super(new Reflector(), SuperAdminGuard.name);
        this._acceptRoles.push(UserRole.SuperAdmin);
    }
}
