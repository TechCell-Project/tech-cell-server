import { Injectable } from '@nestjs/common';
import { UserRole } from '@app/resource/users/enums';
import { AuthCoreGuard } from './auth.core.guard';
import { Reflector } from '@nestjs/core';

/**
 * @description AdminGuard: required login for admin or higher roles
 */
@Injectable()
export class AdminGuard extends AuthCoreGuard {
    constructor() {
        super(new Reflector(), AdminGuard.name);
        this._acceptRoles.push(UserRole.SuperAdmin, UserRole.Admin);
    }
}
