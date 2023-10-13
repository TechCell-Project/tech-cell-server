import { Types } from 'mongoose';

export class CurrentUserDTO {
    _id: Types.ObjectId | string;
    [key: string]: any;
}
