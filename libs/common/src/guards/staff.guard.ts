import { CanActivate, Injectable } from '@nestjs/common';
import { UserRole } from '~libs/resource/users/enums';
import { AuthCoreGuard } from './auth.core.guard';
import { Reflector } from '@nestjs/core';

/**
 * @description StaffGuard: required login for staff role
 */
@Injectable()
export class StaffGuard extends AuthCoreGuard implements CanActivate {
    constructor() {
        super(new Reflector(), StaffGuard.name);
        this._acceptRoles.push(UserRole.Staff);
    }
}
