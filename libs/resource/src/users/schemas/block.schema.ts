import { Prop } from '@nestjs/mongoose';
import { BlockActivity } from '../enums';

class BlockActivitySchema {
    @Prop({ type: String, enum: BlockActivity, default: BlockActivity.Unblock })
    activity: string;

    @Prop({ default: '' })
    activityBy: string;

    @Prop({ default: Date.now })
    activityAt?: Date;

    @Prop({ default: '' })
    activityReason?: string;

    @Prop({ default: '' })
    activityNote?: string;

    @Prop({ default: '' })
    activityIp?: string;
}

export class BlockSchema {
    @Prop({ default: false })
    isBlocked: boolean;

    @Prop({ default: [], type: Array<BlockActivitySchema> })
    activityLogs?: Array<BlockActivitySchema>;
}
