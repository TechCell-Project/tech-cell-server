import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enums';
import { Types } from 'mongoose';
import { AddressSchemaDTO } from './address.schema.dto';
import { BlockSchemaDTO } from './block.schema.dto';
import { User } from '../schemas';

export class UserMntResponseDto implements Omit<User, 'password'> {
    @ApiProperty({
        description: 'The user id',
        type: String,
        example: '6493c67dc0ab97f5eb2beca5',
    })
    _id: Types.ObjectId;

    @ApiProperty({ description: 'The user email', example: 'example@email.com' })
    email: string;

    @ApiProperty({ description: 'The user username', example: 'example' })
    userName: string;

    @ApiProperty({ description: 'Whether the user email is verified or not', example: false })
    emailVerified?: boolean;

    @ApiProperty({ description: 'The user role', example: UserRole.User })
    role?: string;

    @ApiProperty({
        description: 'The user avatar',
        type: String,
        format: 'url',
        required: false,
        example: 'https://cdn.example.com/image.png',
    })
    avatar?: string;

    @ApiProperty({
        description: 'The user address',
        type: [AddressSchemaDTO],
    })
    address?: AddressSchemaDTO[];

    @ApiProperty({ description: 'The user first name', example: 'John' })
    firstName: string;

    @ApiProperty({ description: 'The user last name', example: 'Doe' })
    lastName: string;

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
