import { UserRole } from '@app/resource/users/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class ChangeRoleRequestDTO {
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
