import { PaginationQuery } from '~libs/common/dtos';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { IsEnumI18n } from '~libs/common/i18n';

export enum ReadType {
    read = 'read',
    unread = 'unread',
    all = 'all',
}

export enum OrderBy {
    newest = 'newest',
    oldest = 'oldest',
}

export class GetUserNotificationsDTO extends IntersectionType(PaginationQuery) {
    constructor(data: Partial<GetUserNotificationsDTO>) {
        super(data);
        this.page = data?.page ? Number(data.page) : 1;
        this.pageSize = data?.pageSize ? Number(data.pageSize) : 10;
        this.readType = data?.readType ?? ReadType.all;
        this.orderBy = data?.orderBy ?? OrderBy.newest;
    }

    @ApiProperty({
        required: false,
        enum: ReadType,
        default: ReadType.all,
        type: String,
    })
    @IsOptional()
    @IsEnumI18n(ReadType)
    readType?: ReadType;

    @ApiProperty({
        required: false,
        enum: OrderBy,
        default: OrderBy.newest,
        type: String,
    })
    @IsOptional()
    @IsEnumI18n(OrderBy)
    orderBy?: OrderBy;
}
