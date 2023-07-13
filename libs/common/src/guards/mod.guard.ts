import { Injectable } from '@nestjs/common';
import { UserRole } from '@app/resource/users/enums';
import { AuthCoreGuard } from './auth.core.guard';

@Injectable()
export class ModGuard extends AuthCoreGuard {
    constructor() {
        super();
        this._acceptRoles.push(UserRole.SuperAdmin, UserRole.Admin, UserRole.Mod);
    }
}
