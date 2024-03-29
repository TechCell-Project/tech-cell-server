import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
    UserSearchBlock,
    UserSearchEmailVerified,
    UserSearchSortField,
    UserSearchSortOrder,
    UserSearchRole,
} from '../enums';
import { MAX_USERS_PER_PAGE } from '~libs/common/constants/user.constant';
import { Type } from 'class-transformer';
import { IsEnumI18n, MaxI18n, MinI18n } from '~libs/common/i18n/class-validator-i18n';

export class GetUsersQueryDTO {
    @ApiProperty({
        type: Number,
        description: 'Page of users to be returned',
        required: false,
        minimum: 1,
        maximum: Number.MAX_SAFE_INTEGER,
        default: 1,
    })
    @Type(() => Number)
    @IsOptional()
    @MinI18n(1)
    @MaxI18n(Number.MAX_SAFE_INTEGER)
    page?: number;

    @ApiProperty({
        type: Number,
        description: 'Size of page for users to be returned',
        required: false,
        minimum: 1,
        maximum: MAX_USERS_PER_PAGE,
        default: 10,
    })
    @Type(() => Number)
    @IsOptional()
    @MinI18n(1)
    @MaxI18n(MAX_USERS_PER_PAGE)
    pageSize?: number;

    @ApiProperty({
        type: String,
        description: 'Order of users to be returned',
        required: false,
        enum: UserSearchSortField,
        default: UserSearchSortField.CREATED_AT,
    })
    @IsEnumI18n(UserSearchSortField)
    @IsOptional()
    order_field?: string;

    @ApiProperty({
        type: String,
        description: 'Sort of users to be returned',
        required: false,
        enum: UserSearchSortOrder,
        default: UserSearchSortOrder.DESC,
    })
    @IsEnumI18n(UserSearchSortOrder)
    @IsOptional()
    sort_order?: string;

    @ApiProperty({
        type: String,
        description: 'Search key of users to be returned',
        required: false,
    })
    @IsOptional()
    keyword?: string;

    @ApiProperty({
        type: String,
        description: 'Status of users to be returned',
        required: false,
        enum: UserSearchBlock,
        default: UserSearchBlock.ALL,
    })
    @IsEnumI18n(UserSearchBlock)
    @IsOptional()
    status?: string;

    @ApiProperty({
        type: String,
        enum: UserSearchRole,
        description: 'Role of users to be returned',
        required: false,
        default: UserSearchRole.All,
    })
    @IsOptional()
    @IsEnumI18n(UserSearchRole)
    role?: string;

    @ApiProperty({
        type: String,
        description: 'User with email verified',
        required: false,
        enum: UserSearchEmailVerified,
        default: UserSearchEmailVerified.ALL,
    })
    @IsOptional()
    @IsEnumI18n(UserSearchEmailVerified)
    emailVerified?: string;
}
