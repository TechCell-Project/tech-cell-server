import { UserRole } from '@app/resource/users/enums';

export interface ITokenVerifiedResponse {
    readonly _id: string;
    readonly email: string;
    readonly role: UserRole;
    readonly exp: number;
    readonly iat: number;
}
