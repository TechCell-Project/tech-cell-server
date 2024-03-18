import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { CreateUserRequestDto } from '~apps/managements/users-mnt/dtos';
import { UserRole } from '../enums';
import { Transform } from 'class-transformer';
import { isTrueSet } from '~libs/common/utils/shared.util';
import { DEFAULT_EMAIL_DOMAIN } from '~libs/common/constants';

export class CreateUserDTO {
    constructor(data: CreateUserRequestDto) {
        this.userName = data.userName;
        this.password = data.password;
        this.role = data?.role ?? UserRole.User;
        this.firstName = data?.firstName ?? 'systemF';
        this.lastName = data?.lastName ?? 'systemL';

        this.email = data?.email ?? `${this.userName}${DEFAULT_EMAIL_DOMAIN}`;

        // If email is default, then this email is verified
        this.emailVerified = this.email.endsWith(DEFAULT_EMAIL_DOMAIN) ? true : false;
    }

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    userName: string;

    @IsString()
    @IsNotEmpty()
    @Length(8, 24)
    password: string;

    @IsString()
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsBoolean()
    @IsNotEmpty()
    @Transform(({ value }) => isTrueSet(value))
    emailVerified?: boolean;

    @IsString()
    @IsOptional()
    role?: string;
}
