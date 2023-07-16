import { UserRole } from '@app/resource/users/enums';
import { IsEmail, IsOptional } from 'class-validator';

export class QueryUserParamsDTO {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsOptional()
    all?: boolean;

    @IsOptional()
    limit?: number;

    @IsOptional()
    offset?: number;

    @IsOptional()
    sort?: string;

    @IsOptional()
    order?: string;

    @IsOptional()
    search?: string;

    @IsOptional()
    status?: string;

    @IsOptional()
    role?: string | UserRole;

    @IsOptional()
    isDeleted?: boolean;

    @IsOptional()
    isBlocked?: boolean;

    @IsOptional()
    isVerified?: boolean;

    @IsOptional()
    emailVerified?: boolean;
}
