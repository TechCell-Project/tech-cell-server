import { Types } from 'mongoose';
import { UserRole } from '~libs/resource/users/enums';

export type TCurrentUser = {
    _id: Types.ObjectId | string;
    role: UserRole | string;
    [key: string]: any;
};
