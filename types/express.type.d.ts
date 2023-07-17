import { ICurrentUser } from '@app/common/interfaces';

declare namespace Express {
    interface Request {
        user: ICurrentUser;
    }
}
