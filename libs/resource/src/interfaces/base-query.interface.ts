import { FilterQuery, ProjectionType, QueryOptions } from 'mongoose';

export interface IBaseQuery<T> {
    filterQueries?: Partial<FilterQuery<T>>;
    queryOptions?: Partial<QueryOptions<T>>;
    projectionArgs?: Partial<ProjectionType<T>>;
}
