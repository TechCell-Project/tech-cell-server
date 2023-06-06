import { IUser } from '../user/';

export interface IAuthorizedRequest extends Request {
    user?: IUser;
}
