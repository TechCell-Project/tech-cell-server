import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginRequest {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
