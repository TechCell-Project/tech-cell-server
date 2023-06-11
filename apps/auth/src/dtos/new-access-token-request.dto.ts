import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NewAccessTokenRequestDTO {
    @ApiProperty({
        description: 'the access token of user',
        example: 'the-accessToken',
    })
    @IsString()
    @IsNotEmpty()
    accessToken: string;
}
