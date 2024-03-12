import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyI18n, IsStringI18n } from '~libs/common/i18n';

export class CancelOrderRequestDTO {
    @ApiProperty({
        description: 'Reason for canceling order',
        type: String,
        required: true,
    })
    @IsNotEmptyI18n()
    @IsStringI18n()
    cancelReason: string;
}
