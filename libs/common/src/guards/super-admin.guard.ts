import { Injectable } from '@nestjs/common';
import { AuthCoreGuard } from './auth.core.guard';
import { UserRole } from '@app/resource/users/enums';

@Injectable()
export class SuperAdminGuard extends AuthCoreGuard {
    constructor() {
        super();
        this._acceptRoles.push(UserRole.SuperAdmin);
    }
}
