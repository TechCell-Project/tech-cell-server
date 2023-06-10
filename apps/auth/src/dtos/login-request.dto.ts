import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestDTO {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
