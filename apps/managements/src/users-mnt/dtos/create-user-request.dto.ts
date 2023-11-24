import { UserRole } from '~libs/resource/users/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { IsEmailI18n, IsEnumI18n, IsNotEmptyI18n, IsStringI18n } from '~libs/common/i18n';

export class CreateUserRequestDto {
    @ApiProperty({
        description: 'Username of user',
        example: 'example',
        required: true,
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    userName: string;

    @ApiProperty({
        description: 'Password of user',
        example: '123456',
        required: true,
    })
    @IsStringI18n()
    @IsNotEmptyI18n()
    password: string;

    @ApiProperty({
        description: 'Role of user',
        example: 'admin',
        required: false,
    })
    @IsStringI18n()
    @IsOptional()
    @IsEnumI18n(UserRole)
    role: string;

    @ApiProperty({
        description: 'Email of user',
        example: 'example@techcell.cloud',
        required: false,
    })
    @IsEmailI18n()
    @IsOptional()
    email?: string;

    @ApiProperty({
        description: 'First name of user',
        example: 'John',
        required: false,
    })
    @IsStringI18n()
    @IsOptional()
    firstName?: string;

    @ApiProperty({
        description: 'Last name of user',
        example: 'Doe',
        required: false,
    })
    @IsStringI18n()
    @IsOptional()
    lastName?: string;
}
