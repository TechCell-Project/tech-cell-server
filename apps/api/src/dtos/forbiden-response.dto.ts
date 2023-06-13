import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ForbiddenException, HttpStatus } from '@nestjs/common';

export class ForbiddenResponseDTO extends ForbiddenException {
    @ApiProperty({
        description: 'Number of status code',
        example: HttpStatus.FORBIDDEN,
    })
    @IsNumber()
    statusCode: number;

    @ApiProperty({
        description: 'String of error message',
        example: 'Forbidden',
        type: String,
    })
    @IsString()
    message: string;
}
