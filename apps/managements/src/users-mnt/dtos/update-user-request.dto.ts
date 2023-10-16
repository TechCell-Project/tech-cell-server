import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
        required: true,
    })
    @IsOptional()
    @IsNotEmpty()
    userName?: string;

    @ApiProperty({
        description: 'First name of user',
        example: 'John',
        required: false,
    })
    @IsString()
    @IsOptional()
    firstName?: string;

    @ApiProperty({
        description: 'Last name of user',
        example: 'Doe',
        required: false,
    })
    @IsString()
    @IsOptional()
    lastName?: string;

    @ApiProperty({
        description: "PublicId of user's avatar",
        example: 'example',
        required: true,
    })
    @IsString()
    @IsOptional()
    avatar?: string;
}
