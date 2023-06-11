import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class JwtPayloadDto {
    @Type(() => String)
    @IsNotEmpty()
    @IsString()
    _id: string | Types.ObjectId;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    role: string;
}
