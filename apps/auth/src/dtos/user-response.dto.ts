import { Exclude, Type } from 'class-transformer';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class UserDataResponseDto {
    @Type(() => String)
    @IsNotEmpty()
    _id: string | Types.ObjectId;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsArray()
    @IsOptional()
    @IsString({ each: true, message: 'Each item should be string' })
    address?: Array<string>;

    @IsString()
    @IsNotEmpty()
    role?: string;

    constructor(partial: Partial<UserDataResponseDto>) {
        Object.assign(this, partial);
    }
}
