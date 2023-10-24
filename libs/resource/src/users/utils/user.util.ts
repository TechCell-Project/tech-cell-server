import { User } from '../schemas/user.schema';

export function cleanUserBeforeResponse(user: User): Omit<User, 'password' | 'block'> {
    if (user?.password) delete user.password;
    if (user?.block) delete user.block;
    return user;
}
