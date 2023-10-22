import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserRequestDTO {
    constructor(data: Partial<UpdateUserRequestDTO>) {
        if (data?.userName) {
            this.userName = data.userName;
        }

        if (data?.firstName) {
            this.firstName = data.firstName;
        }

        if (data?.lastName) {
            this.lastName = data.lastName;
        }

        if (data?.avatar) {
            this.avatar = data.avatar;
        }
    }

    @ApiProperty({
        description: 'Username of user',
        example: 'example',
        required: false,
        minLength: 6,
        maxLength: 24,
    })
    @IsOptional()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(24)
    userName?: string;

    @ApiProperty({
        description: 'First name of user',
        example: 'John',
        required: false,
        minLength: 1,
    })
    @IsString()
    @IsOptional()
    @MinLength(1)
    firstName?: string;

    @ApiProperty({
        description: 'Last name of user',
        example: 'Doe',
        required: false,
        minLength: 1,
    })
    @IsString()
    @IsOptional()
    @MinLength(1)
    lastName?: string;

    @ApiProperty({
        description: "PublicId of user's avatar",
        example: 'example',
        required: false,
    })
    @IsString()
    @IsOptional()
    avatar?: string;
}
