import { TCurrentUser } from '~libs/common/types';

declare namespace Express {
    interface Request {
        user: TCurrentUser;
    }
}
