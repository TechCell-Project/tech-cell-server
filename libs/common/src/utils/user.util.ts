import { UserRole } from '@app/resource/users/enums';
import { generateRandomString } from './shared.util';

export const isSuperAdmin = (user: any) => user.role === UserRole.SuperAdmin;
export const isAdmin = (user: any) => user.role === UserRole.Admin;
export const isMod = (user: any) => user.role === UserRole.Mod;
export const isUser = (user: any) => user.role === UserRole.User;

export const buildUniqueUserNameFromEmail = (email: string) =>
    `${email.split('@')[0]}_${email.split('@')[1]}_${generateRandomString(6)}`;
