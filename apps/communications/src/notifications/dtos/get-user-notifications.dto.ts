import { PaginationQuery } from '@app/common/dtos';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum ReadType {
    read = 'read',
    unread = 'unread',
    all = 'all',
}

export class GetUserNotificationsDTO extends IntersectionType(PaginationQuery) {
    constructor(data: Partial<GetUserNotificationsDTO>) {
        super(data);
        this.page = super.page;
        this.pageSize = super.pageSize;
        this.readType = data?.readType ?? ReadType.all;
    }

    @ApiProperty({
        required: false,
        enum: ReadType,
        default: ReadType.all,
        type: String,
    })
    @IsOptional()
    @IsEnum(ReadType)
    readType?: ReadType;
}
