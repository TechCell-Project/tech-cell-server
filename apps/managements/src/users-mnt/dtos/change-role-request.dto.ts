import { UserRole } from '@app/resource/users/enums';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class ChangeRoleRequestDTO {
    /**
     * userId is auto passed from middleware
     */
    @ApiHideProperty()
    @IsNotEmpty()
    @IsString()
    userId: string;

    @ApiProperty({
        description: 'User role',
        example: 'Admin',
        type: 'string',
        enum: UserRole,
    })
    @IsNotEmpty()
    @IsString()
    @IsEnum(UserRole)
    role: string;
}
