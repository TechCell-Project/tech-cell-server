import { applyDecorators, UseGuards } from '@nestjs/common';
import { RequiredRoles } from './required-role.decorator';
import { AuthGuard } from '../guards';
import { UserRole } from '~libs/resource/users/enums';

/**
 * Auth decorator for authorization
 * @param roles {UserRole[]} required roles
 */
export function Auth(...roles: UserRole[]) {
    return applyDecorators(RequiredRoles(...roles), UseGuards(AuthGuard));
}
