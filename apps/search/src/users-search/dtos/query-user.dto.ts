import { UserRole } from '@app/resource/users/enums';
import { Type } from 'class-transformer';
import { IsEmail, IsNumber, IsOptional } from 'class-validator';

export class QueryUserParamsDTO {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsOptional()
    all?: boolean;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    pageSize?: number;

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
