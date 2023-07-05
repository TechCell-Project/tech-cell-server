import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enums';
import { Types } from 'mongoose';

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

class BlockSchemaDTO {
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

export class UserMntResponseDto {
    @ApiProperty({
        description: 'The user id',
        type: String,
        example: '6493c67dc0ab97f5eb2beca5',
    })
    _id: string | Types.ObjectId;

    @ApiProperty({ description: 'The user email', example: 'example@email.com' })
    email: string;

    @ApiProperty({ description: 'Whether the user email is verified or not', example: false })
    emailVerified?: boolean;

    @ApiProperty({ description: 'The user role', example: UserRole.User })
    role?: string;

    @ApiProperty({
        description: 'The user address',
        example: ['address1', 'address2'],
    })
    address?: string[];

    @ApiProperty({ description: 'The user first name', example: 'John' })
    firstName?: string;

    @ApiProperty({ description: 'The user last name', example: 'Doe' })
    lastName?: string;

    @ApiProperty({
        description: 'The user block',
        type: BlockSchemaDTO,
    })
    block?: BlockSchemaDTO;

    @ApiProperty({
        description: 'The user created date',
        example: '2023-07-02T03:12:48.087Z',
    })
    createdAt?: Date;

    @ApiProperty({ description: 'The user updated date', example: '2023-07-02T03:12:48.087Z' })
    updatedAt?: Date;
}
