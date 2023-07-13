import { Types } from 'mongoose';

export interface ICurrentUser {
    _id: string | Types.ObjectId;
    [key: string]: any;
}
