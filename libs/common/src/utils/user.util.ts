import { UserRole } from '~libs/resource/users/enums';
import { generateRandomString } from './shared.util';

export const isSuperAdmin = (user: any) => user.role === UserRole.Manager;
export const isAdmin = (user: any) => user.role === UserRole.Staff;
export const isUser = (user: any) => user.role === UserRole.User;

export const buildUniqueUserNameFromEmail = (email: string) =>
    `${email.split('@')[0]}_${email.split('@')[1]}_${generateRandomString(6)}`;
