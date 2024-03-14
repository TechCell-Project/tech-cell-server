import { UserRole } from '~libs/resource/users/enums';

export const NotifyRoom = {
    AdminRoom: `${UserRole.Staff}_room`,
    UserRoom: `${UserRole.User}_room`,
    SuperAdminRoom: `${UserRole.Manager}_room`,
    AllUserRoom: `all_${UserRole.User}_room`,
};

export const NOTIFICATIONS_PREFIX = 'notifications';

export const NOTIFICATIONS_JOB_CREATE = 'notifications_job_queue_create';
export const NOTIFICATIONS_JOB_PUSH_ALL = 'notifications_job_queue_push_all';
