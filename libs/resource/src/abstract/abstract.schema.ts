import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Factory } from 'nestjs-seeder';

/**
 * @description Abstract document
 *
 * `FeatureName` is a `Class.Name`
 *
 * `CollectionName` is a lowercase and plural of `FeatureName`
 */
@Schema()
export class AbstractDocument {
    @Factory(() => new Types.ObjectId())
    @Prop({ type: Types.ObjectId, default: new Types.ObjectId() })
    _id: Types.ObjectId;
}
