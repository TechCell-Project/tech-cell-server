import { IsEmail, IsString, Length } from 'class-validator';

export class RegisterRequestDTO {
    @IsEmail()
    email: string;

    @IsString()
    @Length(8, 24)
    password: string;

    @IsString()
    @Length(8, 24)
    re_password: string;
}
