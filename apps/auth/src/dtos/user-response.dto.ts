import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { UserRole } from '@app/resource/users/enums';
import { AddressSchemaDTO, ImageSchemaDTO } from '@app/resource/users/dtos';
import { User } from '@app/resource';

export class UserDataResponseDTO implements Omit<User, 'password'> {
    @ApiProperty({
        example: '6487d9e0949d97a9ba8bffff',
    })
    @Type(() => String)
    @IsNotEmpty()
    _id: Types.ObjectId;

    @ApiProperty({ type: String, format: 'email' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ type: String, example: 'username_example' })
    @IsString()
    @IsNotEmpty()
    userName: string;

    @ApiProperty({ type: String, example: 'John' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ type: String, example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ type: [AddressSchemaDTO] })
    @IsArray()
    @IsOptional()
    address?: AddressSchemaDTO[];

    @ApiProperty({ enum: UserRole, example: UserRole.User })
    @IsEnum(UserRole)
    @IsNotEmpty()
    role?: UserRole | string;

    @ApiProperty({
        description: 'The user avatar',
        type: ImageSchemaDTO,
        required: false,
    })
    @IsOptional()
    avatar?: ImageSchemaDTO;

    @ApiProperty({ type: String, example: 'the-access-token' })
    @IsString()
    accessToken: string;

    @ApiProperty({ type: String, example: 'the-refresh-token' })
    @IsString()
    refreshToken: string;

    constructor(partial: Partial<UserDataResponseDTO>) {
        Object.assign(this, partial);
    }
}
