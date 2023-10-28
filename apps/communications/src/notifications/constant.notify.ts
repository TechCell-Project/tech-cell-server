import { UserRole } from '@app/resource/users/enums';

export const NotifyRoom = {
    AdminRoom: `${UserRole.Admin}_room`,
    ModRoom: `${UserRole.Mod}_room`,
    UserRoom: `${UserRole.User}_room`,
    SuperAdminRoom: `${UserRole.SuperAdmin}_room`,
    AllUserRoom: `all_${UserRole.User}_room`,
};
