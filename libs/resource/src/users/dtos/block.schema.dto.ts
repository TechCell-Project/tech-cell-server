import { ApiProperty } from '@nestjs/swagger';

class BlockActivitySchemaDTO {
    activity: string;

    @ApiProperty({ description: 'The user who performed the activity', example: 'John Doe' })
    activityBy: string;

    @ApiProperty({
        description: 'The date and time of the activity',
        example: '2020-01-01T00:00:00Z',
    })
    activityAt?: Date;

    @ApiProperty({
        description: 'The reason for the activity',
        example: 'User violated terms of service',
    })
    activityReason?: string;

    @ApiProperty({
        description: 'Additional notes about the activity',
        example: 'User was warned previously',
    })
    activityNote?: string;

    @ApiProperty({
        description: 'The IP address of the user when the activity was performed',
        example: '127.0.0.1',
    })
    activityIp?: string;
}

export class BlockSchemaDTO {
    @ApiProperty({ description: 'Whether the user is blocked or not', example: true })
    isBlocked: boolean;

    @ApiProperty({
        description: 'An array of activities performed on the user',
        type: [BlockActivitySchemaDTO],
        example: [
            {
                activity: 'Block',
                activityBy: '6493c67dc0ab97f5eb2beca5',
                activityReason: 'User violated terms of service',
                activityNote: 'User was warned previously',
            },
        ],
    })
    activityLogs?: Array<BlockActivitySchemaDTO>;
}
