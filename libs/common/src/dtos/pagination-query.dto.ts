import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class PaginationQuery {
    /**
     * @description Parse page and pageSize from query to number and set default value
     * @default page = 1
     * @default pageSize = 10
     * @param query
     */
    constructor(query: Partial<PaginationQuery>) {
        this.page = query?.page ? Number(query.page) : 1;
        this.pageSize = query?.pageSize ? Number(query.pageSize) : 10;
    }

    @ApiProperty({
        type: Number,
        description: 'Page number',
        default: 1,
        minimum: 1,
        maximum: Number.MAX_SAFE_INTEGER,
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(Number.MAX_SAFE_INTEGER)
    page?: number;

    @ApiProperty({
        type: Number,
        description: 'Number of items per page',
        default: 10,
        minimum: 1,
        maximum: 500,
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(500)
    pageSize?: number;
}
