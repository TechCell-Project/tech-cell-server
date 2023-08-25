import { Injectable } from '@nestjs/common';
import { UserRole } from '@app/resource/users/enums';
import { AuthCoreGuard } from './auth.core.guard';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ModGuard extends AuthCoreGuard {
    constructor() {
        super(new Reflector(), ModGuard.name);
        this._acceptRoles.push(UserRole.SuperAdmin, UserRole.Admin, UserRole.Mod);
    }
}
