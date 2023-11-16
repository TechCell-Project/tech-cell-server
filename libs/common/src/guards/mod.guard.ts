import { CanActivate, Injectable } from '@nestjs/common';
import { UserRole } from '@app/resource/users/enums';
import { AuthCoreGuard } from './auth.core.guard';
import { Reflector } from '@nestjs/core';

/**
 * @description ModGuard: required login for mod or higher roles
 */
@Injectable()
export class ModGuard extends AuthCoreGuard implements CanActivate  {
    constructor() {
        super(new Reflector(), ModGuard.name);
        this._acceptRoles.push(UserRole.SuperAdmin, UserRole.Admin, UserRole.Mod);
    }
}
