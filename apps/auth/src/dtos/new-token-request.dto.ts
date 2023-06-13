import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NewTokenRequestDTO {
    @ApiProperty({
        description: 'the refresh token of user',
        example: 'the-refreshToken',
    })
    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}
