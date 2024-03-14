import { SetMetadata } from '@nestjs/common';
import { UserRole } from '~libs/resource/users/enums';

export const RequiredRoles = (...roles: UserRole[]) => SetMetadata(RequiredRoles.name, roles);
