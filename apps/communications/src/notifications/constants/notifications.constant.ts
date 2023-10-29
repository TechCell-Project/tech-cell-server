import { UserRole } from '@app/resource/users/enums';

export const NotifyRoom = {
    AdminRoom: `${UserRole.Admin}_room`,
    ModRoom: `${UserRole.Mod}_room`,
    UserRoom: `${UserRole.User}_room`,
    SuperAdminRoom: `${UserRole.SuperAdmin}_room`,
    AllUserRoom: `all_${UserRole.User}_room`,
};

export const NOTIFICATIONS_PREFIX = 'notifications';

export const NOTIFICATIONS_JOB_CREATE = 'notifications_job_queue_create';
export const NOTIFICATIONS_JOB_PUSH_ALL = 'notifications_job_queue_push_all';
