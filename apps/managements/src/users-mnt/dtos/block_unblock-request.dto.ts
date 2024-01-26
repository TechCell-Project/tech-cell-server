import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { IsStringI18n } from '~libs/common/i18n';

export class BlockUnblockRequestDTO {
    @ApiProperty({ type: String, description: 'Block or unblock reason', required: false })
    @IsOptional()
    @IsStringI18n()
    reason?: string;

    @ApiProperty({ type: String, description: 'Block or unblock note', required: false })
    @IsOptional()
    @IsStringI18n()
    note?: string;
}
