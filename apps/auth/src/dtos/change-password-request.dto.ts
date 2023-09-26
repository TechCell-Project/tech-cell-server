import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '~/constants';

export class ChangePasswordRequestDTO {
    constructor(data: ChangePasswordRequestDTO) {
        this.oldPassword = data?.oldPassword;
        this.newPassword = data?.newPassword;
        this.reNewPassword = data?.reNewPassword;
    }

    @ApiProperty({ description: 'Old password', type: String })
    @IsString()
    @IsNotEmpty()
    oldPassword: string;

    @ApiProperty({
        description: 'New password to change',
        type: String,
        minLength: PASSWORD_MIN_LENGTH,
        maxLength: PASSWORD_MAX_LENGTH,
    })
    @IsString()
    @IsNotEmpty()
    @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
    newPassword: string;

    @ApiProperty({
        description: 'Re-new password to change, must be same with `newPassword`',
        type: String,
        minLength: PASSWORD_MIN_LENGTH,
        maxLength: PASSWORD_MAX_LENGTH,
    })
    @IsString()
    @IsNotEmpty()
    @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
    reNewPassword: string;
}
