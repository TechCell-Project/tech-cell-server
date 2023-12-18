import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { IsNumberI18n, MaxI18n, MinI18n } from '../i18n';

export class PaginationQuery {
    /**
     * @description Parse page and pageSize from query to number and set default value
     * @default page = 1
     * @default pageSize = 10
     * @param query
     */
    constructor({ page = 1, pageSize = 10 }: Partial<PaginationQuery>) {
        this.page = Number(page);
        this.pageSize = Math.min(500, Number(pageSize));
    }

    @ApiProperty({
        type: Number,
        description: 'Page number',
        default: 1,
        minimum: 1,
        maximum: Number.MAX_SAFE_INTEGER,
        required: false,
    })
    @IsOptional()
    @IsNumberI18n()
    @Type(() => Number)
    @MinI18n(1)
    @MaxI18n(Number.MAX_SAFE_INTEGER)
    page?: number;

    @ApiProperty({
        type: Number,
        description: 'Number of items per page',
        default: 10,
        minimum: 1,
        maximum: 500,
        required: false,
    })
    @IsOptional()
    @IsNumberI18n()
    @Type(() => Number)
    @MinI18n(1)
    @MaxI18n(500)
    pageSize?: number;
}
