import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

interface IListDataResponse<T> {
    page?: number;
    pageSize?: number;
    totalPage?: number;
    totalRecord?: number;
    data?: Array<T>;
}

export class ListDataResponseDTO<T> {
    constructor({
        page = 0,
        pageSize = 0,
        totalPage = 0,
        totalRecord = 0,
        data = [],
    }: IListDataResponse<T>) {
        this.page = page;
        this.pageSize = pageSize;
        this.totalPage = totalPage;
        this.totalRecord = totalRecord;
        this.data = data;
    }

    @ApiProperty({
        example: 1,
        description: 'Page number',
        type: Number,
    })
    @IsNumber()
    page: number;

    @ApiProperty({
        example: 10,
        description: 'Page size',
        type: Number,
    })
    @IsNumber()
    pageSize: number;

    @ApiProperty({
        example: 1,
        description: 'Total page with page size',
        type: Number,
    })
    @IsNumber()
    totalPage: number;

    @ApiProperty({
        example: 10,
        description: 'Total record with filter',
        type: Number,
    })
    @IsNumber()
    totalRecord: number;

    @ApiProperty({
        example: [],
        description: 'Array of data response same as get one response but in array',
        type: Array<T>,
    })
    @IsArray()
    data: Array<T>;
}
