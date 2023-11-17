import { UserRole } from '~libs/resource/users/enums';

export interface ITokenVerifiedResponse {
    readonly _id: string;
    readonly email: string;
    readonly role: UserRole | string;
    readonly exp: number;
    readonly iat: number;
}
