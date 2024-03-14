import { SetMetadata } from '@nestjs/common';
import {
    SKIP_AUTH_SUPER_ADMIN_GUARD,
    SKIP_AUTH_ADMIN_GUARD,
    SKIP_AUTH_MOD_GUARD,
    SKIP_AUTH_GUARD,
} from '~libs/common/constants/auth.constant';

export const SkipAuthGuard = () => SetMetadata(SKIP_AUTH_GUARD, true);
export const SkipAuthSuperAdminGuard = () => SetMetadata(SKIP_AUTH_SUPER_ADMIN_GUARD, true);
export const SkipAuthAdminGuard = () => SetMetadata(SKIP_AUTH_ADMIN_GUARD, true);
export const SkipAuthStaffGuard = () => SetMetadata(SKIP_AUTH_MOD_GUARD, true);
