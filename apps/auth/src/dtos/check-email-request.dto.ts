import { ApiProperty } from '@nestjs/swagger';
import { IsEmailI18n, IsNotEmptyI18n } from '~libs/common/i18n';

export class EmailRequestDTO {
    @ApiProperty({
        description: 'The email of user to check exists',
        example: 'example@techcell.com',
    })
    @IsEmailI18n()
    @IsNotEmptyI18n()
    email: string;
}
