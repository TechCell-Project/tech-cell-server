import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDTO {
    @ApiProperty({
        description: 'the email of user',
        example: 'example@techcell.cloud',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;
}
