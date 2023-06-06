import { IUser } from './user.interface';

export interface IServiceUserGetManyResponse {
    status: number;
    message: string;
    users: IUser[] | null;
}
