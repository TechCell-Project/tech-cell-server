import { Injectable, Logger } from '@nestjs/common';
import { User, UsersService } from '~libs/resource/users';
import { GetUsersQueryDTO } from './dtos';
import { FilterQuery, QueryOptions } from 'mongoose';
import {
    UserSearchBlock,
    UserSearchEmailVerified,
    UserSearchRole,
    UserSearchSortField,
    UserSearchSortOrder,
} from './enums';
import { generateRegexQuery } from 'regex-vietnamese';
import { RedisService } from '~libs/common/Redis/services';

@Injectable()
export class UsersSearchUtilService {
    constructor(
        protected readonly usersService: UsersService,
        protected redisService: RedisService,
        protected readonly logger: Logger,
    ) {
        this.logger = new Logger(UsersSearchUtilService.name);
    }

    protected buildFilterQuery(payload: GetUsersQueryDTO) {
        const filterQuery: FilterQuery<User> = {};

        if (payload?.keyword) {
            const keywordRegex = generateRegexQuery(payload.keyword);
            Object.assign(filterQuery, {
                $or: [
                    { userName: keywordRegex },
                    { email: keywordRegex },
                    { firstName: keywordRegex },
                    { lastName: keywordRegex },
                    { role: keywordRegex },
                ],
            });
        }

        if (payload?.status) {
            switch (payload.status) {
                case UserSearchBlock.BLOCKED:
                    Object.assign(filterQuery, {
                        'block.isBlocked': true,
                    });
                    break;
                case UserSearchBlock.UNBLOCKED:
                    Object.assign(filterQuery, {
                        'block.isBlocked': {
                            $in: [false, undefined, null],
                        },
                    });
                    break;
                case UserSearchBlock.ALL:
                default:
                    delete filterQuery?.block;
                    break;
            }
        }

        if (payload?.role && payload.role !== UserSearchRole.All) {
            Object.assign(filterQuery, {
                role: payload.role,
            });
        }

        if (payload?.emailVerified) {
            switch (payload.emailVerified) {
                case UserSearchEmailVerified.VERIFIED:
                    Object.assign(filterQuery, {
                        emailVerified: true,
                    });
                    break;
                case UserSearchEmailVerified.UNVERIFIED:
                    Object.assign(filterQuery, {
                        emailVerified: false,
                    });
                    break;
                case UserSearchEmailVerified.ALL:
                default:
                    delete filterQuery?.emailVerified;
                    break;
            }
        }

        return filterQuery;
    }

    protected buildQueryOptions(payload: GetUsersQueryDTO) {
        const {
            page,
            pageSize,
            order_field = UserSearchSortField.CREATED_AT,
            sort_order = UserSearchSortOrder.DESC,
        } = payload;
        const queryOptions: QueryOptions<User> = {
            skip: page ? (page - 1) * pageSize : 0,
            limit: pageSize || 10,
        };

        if (order_field) {
            queryOptions.sort = {
                [order_field]: sort_order === UserSearchSortOrder.ASC ? 1 : -1,
            };
        }
        return queryOptions;
    }
}
