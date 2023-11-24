import { ApiProperty } from '@nestjs/swagger';
import { IsEmailI18n, IsNotEmptyI18n } from '~libs/common/i18n';

export class ForgotPasswordDTO {
    @ApiProperty({
        description: 'the email of user',
        example: 'example@techcell.cloud',
    })
    @IsEmailI18n()
    @IsNotEmptyI18n()
    email: string;
}
