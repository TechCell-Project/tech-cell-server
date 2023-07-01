import { Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class BlockLogs {
    @Prop({ required: true })
    blockedBy: string;

    @Prop({ default: Date.now })
    blockedAt: Date;
}

class UnblockLogs {
    @Prop({ required: true })
    unblockedBy: string;

    @Prop({ default: Date.now })
    unblockedAt: Date;
}

export class Block extends Document {
    @Prop({ default: false })
    isBlocked: boolean;

    @Prop({ default: [], type: Array<BlockLogs> })
    blockLogs?: Array<BlockLogs>;

    @Prop({ default: [], type: Array<UnblockLogs> })
    unblockLogs?: Array<UnblockLogs>;
}
