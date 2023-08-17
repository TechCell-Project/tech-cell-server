import { Attribute, Category, Product, User } from '@app/resource';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

interface IListDataResponse {
    page?: number;
    pageSize?: number;
    totalPage?: number;
    totalRecord?: number;
    data?: (User | Attribute | Product | Category)[];
}

export class ListDataResponseDTO {
    constructor({
        page = 0,
        pageSize = 0,
        totalPage = 0,
        totalRecord = 0,
        data = [],
    }: IListDataResponse) {
        this.page = page;
        this.pageSize = pageSize;
        this.totalPage = totalPage;
        this.totalRecord = totalRecord;
        this.data = data;
    }

    @ApiProperty({
        example: 1,
        description: 'Page number',
    })
    @IsNumber()
    page: number;

    @ApiProperty({
        example: 10,
        description: 'Page size',
    })
    @IsNumber()
    pageSize: number;

    @ApiProperty({
        example: 1,
        description: 'Total page',
    })
    @IsNumber()
    totalPage: number;

    @ApiProperty({
        example: 10,
        description: 'Total record',
    })
    @IsNumber()
    totalRecord: number;

    @ApiProperty({
        example: [],
        description: 'Array of data response',
    })
    @IsArray()
    data: Array<User | Attribute | Product | Category>;
}
