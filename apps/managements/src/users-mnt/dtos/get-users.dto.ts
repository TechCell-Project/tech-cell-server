import { UserRole } from '@app/resource/users/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

class BlockSchema {
    @IsOptional()
    isBlocked: boolean;
}

export class GetUsersDTO {
    @ApiProperty({ type: Boolean, description: 'All of users to be returned', required: false })
    @IsOptional()
    all?: boolean;

    @ApiProperty({ type: Number, description: 'Limit of users to be returned', required: false })
    @IsOptional()
    limit?: number;

    @ApiProperty({ type: Number, description: 'Offset of users to be returned', required: false })
    @IsOptional()
    offset?: number;

    // @ApiProperty({ type: String, description: 'Sort of users to be returned', required: false })
    @IsOptional()
    sort?: string;

    // @ApiProperty({ type: String, description: 'Order of users to be returned', required: false })
    @IsOptional()
    order?: string;

    // @ApiProperty({
    //     type: String,
    //     description: 'Search key of users to be returned',
    //     required: false,
    // })
    @IsOptional()
    search?: string;

    // @ApiProperty({ type: String, description: 'Status of users to be returned', required: false })
    @IsOptional()
    status?: string;

    // @ApiProperty({ enum: UserRole, description: 'Role of users to be returned', required: false })
    @IsOptional()
    @IsEnum(UserRole)
    role?: string;

    // @IsOptional()
    // isDeleted?: boolean;

    @IsOptional()
    block?: BlockSchema;

    @IsOptional()
    isVerified?: boolean;

    // @ApiProperty({ type: Boolean, description: 'User with email verified', required: false })
    @IsOptional()
    emailVerified?: boolean;
}
