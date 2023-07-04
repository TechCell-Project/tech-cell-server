import { UserRole } from '@app/resource/users/enums';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class ChangeRoleRequestDTO {
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsString()
    @IsEnum(UserRole)
    role: string;
}
