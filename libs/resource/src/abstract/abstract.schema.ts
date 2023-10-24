import { Prop, Schema } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

/**
 * @description Abstract document
 *
 * `FeatureName` is a `Class.Name`
 *
 * `CollectionName` is a lowercase and plural of `FeatureName`
 */
@Schema()
export class AbstractDocument {
    @Prop({ type: SchemaTypes.ObjectId })
    _id: Types.ObjectId;
}
