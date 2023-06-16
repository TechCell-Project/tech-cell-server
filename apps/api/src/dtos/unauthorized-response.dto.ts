import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UnauthorizedException, HttpStatus } from '@nestjs/common';

export class UnauthorizedResponseDTO extends UnauthorizedException {
    @ApiProperty({
        description: 'Number of status code',
        example: HttpStatus.UNAUTHORIZED,
    })
    @IsNumber()
    statusCode: number;

    @ApiProperty({
        description: 'String of error message',
        example: 'Unauthorized',
        type: String,
    })
    @IsString()
    message: string;
}
