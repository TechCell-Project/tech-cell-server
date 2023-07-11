import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class BlockUnblockRequestDTO {
    @ApiProperty({ type: String, description: 'Block or unblock reason', required: false })
    @IsOptional()
    reason?: string;

    @ApiProperty({ type: String, description: 'Block or unblock note', required: false })
    @IsOptional()
    note?: string;

    /**
     * `userId` is auto pass from middleware `jwt.middleware.ts`
     * @type {string}
     * @description User id who perform this action
     */
    @ApiHideProperty()
    @IsString()
    userId: string;
}
