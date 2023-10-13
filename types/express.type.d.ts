import { TCurrentUser } from '@app/common/types';

declare namespace Express {
    interface Request {
        user: TCurrentUser;
    }
}
