import { Types } from 'mongoose';

export type ICurrentUser = {
    _id: Types.ObjectId | string;
    [key: string]: any;
};
