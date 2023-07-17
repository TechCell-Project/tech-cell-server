import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class BlockUnblockRequestDTO {
    @ApiProperty({ type: String, description: 'Block or unblock reason', required: false })
    @IsOptional()
    reason?: string;

    @ApiProperty({ type: String, description: 'Block or unblock note', required: false })
    @IsOptional()
    note?: string;
}
