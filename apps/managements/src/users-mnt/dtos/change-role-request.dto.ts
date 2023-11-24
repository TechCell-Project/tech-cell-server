import { UserRole } from '~libs/resource/users/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnumI18n, IsNotEmptyI18n, IsStringI18n } from '~libs/common/i18n';

export class ChangeRoleRequestDTO {
    @ApiProperty({
        description: 'User role',
        example: 'Admin',
        type: 'string',
        enum: UserRole,
    })
    @IsNotEmptyI18n()
    @IsStringI18n()
    @IsEnumI18n(UserRole)
    role: string;
}
