import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../users/types';

export class UserDataResponseDTO {
    @ApiProperty()
    @Type(() => String)
    @IsNotEmpty()
    _id: string | Types.ObjectId;

    @ApiProperty({ type: String, format: 'email' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ type: [String], minLength: 1 })
    @IsArray()
    @IsOptional()
    @IsString({ each: true, message: 'Each item should be string' })
    address?: string[];

    @ApiProperty({ enum: UserRole })
    @IsEnum(UserRole)
    @IsNotEmpty()
    role?: UserRole;

    @ApiProperty({ type: String })
    @IsString()
    accessToken: string;

    @ApiProperty({ type: String })
    @IsString()
    refreshToken: string;

    constructor(partial: Partial<UserDataResponseDTO>) {
        Object.assign(this, partial);
    }
}
