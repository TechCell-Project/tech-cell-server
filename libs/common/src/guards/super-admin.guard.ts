import { Injectable } from '@nestjs/common';
import { AuthCoreGuard } from './auth.core.guard';
import { UserRole } from '@app/resource/users/enums';
import { Reflector } from '@nestjs/core';

@Injectable()
export class SuperAdminGuard extends AuthCoreGuard {
    constructor() {
        super(new Reflector(), SuperAdminGuard.name);
        this._acceptRoles.push(UserRole.SuperAdmin);
    }
}
