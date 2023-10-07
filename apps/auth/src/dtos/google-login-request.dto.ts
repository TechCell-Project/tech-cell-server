import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginRequestDTO {
    @ApiProperty({
        type: String,
        description: 'Google id token',
        example: '1234567890abcdefg',
    })
    @IsString()
    @IsNotEmpty()
    idToken: string;
}
