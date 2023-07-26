import { FilterQuery, ProjectionType } from 'mongoose';
import { Attribute } from '../schemas';

export interface IBaseQuery {
    getAttributesArgs?: Partial<Attribute>;
    queryArgs?: Partial<FilterQuery<Attribute>>;
    projectionArgs?: Partial<ProjectionType<Attribute>>;
}
