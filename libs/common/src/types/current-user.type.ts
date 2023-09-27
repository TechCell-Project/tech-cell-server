import { Types } from 'mongoose';

export type TCurrentUser = {
    _id: Types.ObjectId | string;
    [key: string]: any;
};
