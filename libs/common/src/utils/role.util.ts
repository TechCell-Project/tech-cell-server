import { UserRole } from '@app/resource/users/enums';

export const isSuperAdmin = (user: any) => user.role === UserRole.SuperAdmin;
export const isAdmin = (user: any) => user.role === UserRole.Admin;
export const isMod = (user: any) => user.role === UserRole.Mod;
export const isUser = (user: any) => user.role === UserRole.User;
