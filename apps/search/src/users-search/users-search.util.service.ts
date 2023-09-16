import { Inject, Injectable, Logger } from '@nestjs/common';
import { REDIS_CACHE } from '~/constants';
import { User, UsersService } from '@app/resource/users';
import { Store } from 'cache-manager';
import { GetUsersDTO } from './dtos';
import { FilterQuery, QueryOptions } from 'mongoose';
import { UserSearchBlock, UserSearchRole, UserSearchSortField, UserSearchSortOrder } from './enums';

@Injectable()
export class UsersSearchUtilService {
    constructor(
        protected readonly usersService: UsersService,
        @Inject(REDIS_CACHE) protected cacheManager: Store,
        protected readonly logger: Logger,
    ) {
        this.logger = new Logger(UsersSearchUtilService.name);
    }

    protected buildFilterQuery(payload: GetUsersDTO) {
        const filterQuery: FilterQuery<User> = {};

        if (payload.keyword) {
            Object.assign(filterQuery, {
                $or: [
                    { userName: { $regex: payload.keyword, $options: 'i' } },
                    { email: { $regex: payload.keyword, $options: 'i' } },
                    { firstName: { $regex: payload.keyword, $options: 'i' } },
                    { lastName: { $regex: payload.keyword, $options: 'i' } },
                    { role: { $regex: payload.keyword, $options: 'i' } },
                ],
            });
        }

        if (payload.status) {
            if (payload.status !== UserSearchBlock.ALL) {
                switch (payload.status) {
                    case UserSearchBlock.BLOCKED:
                        filterQuery.block.isBlocked = true;
                        break;
                    case UserSearchBlock.UNBLOCKED:
                        filterQuery.block.isBlocked = false;
                        break;
                    default:
                        delete filterQuery.block;
                        break;
                }
            }
        }

        if (payload.role) {
            filterQuery.role = payload.role;
            if (payload.role === UserSearchRole.ALL) {
                delete filterQuery.role;
            }
        }

        if (payload.emailVerified) {
            switch (payload.emailVerified) {
                case UserSearchBlock.BLOCKED:
                    filterQuery.emailVerified = true;
                    break;
                case UserSearchBlock.UNBLOCKED:
                    filterQuery.emailVerified = false;
                    break;
                default:
                    delete filterQuery.emailVerified;
                    break;
            }
        }

        return filterQuery;
    }

    protected buildQueryOptions(payload: GetUsersDTO) {
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
