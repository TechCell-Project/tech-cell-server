import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
        minLength: 8,
        maxLength: 24,
    })
    @IsString()
    @IsNotEmpty()
    @Length(8, 24)
    newPassword: string;

    @ApiProperty({
        description: 'Re-new password to change, must be same with `newPassword`',
        type: String,
        minLength: 8,
        maxLength: 24,
    })
    @IsString()
    @IsNotEmpty()
    @Length(8, 24)
    reNewPassword: string;
}
