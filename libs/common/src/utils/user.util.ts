import { UserRole } from '~libs/resource/users/enums';
import { generateRandomString } from './shared.util';
import { User } from '~libs/resource';

export const isManager = (user: User) => user.role === UserRole.Manager;
export const isStaff = (user: User) => user.role === UserRole.Staff;
export const isUser = (user: User) => user.role === UserRole.User;

export const buildUniqueUserNameFromEmail = (email: string) =>
    `${email.split('@')[0]}_${email.split('@')[1]}_${generateRandomString(6)}`;
