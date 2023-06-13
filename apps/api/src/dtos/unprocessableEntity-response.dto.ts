import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UnprocessableEntityException, HttpStatus } from '@nestjs/common';

export class UnprocessableEntityResponseDTO extends UnprocessableEntityException {
    @ApiProperty({
        description: 'Number of status code',
        example: HttpStatus.UNPROCESSABLE_ENTITY,
    })
    @IsNumber()
    statusCode: number;

    @ApiProperty({
        description: 'String of error message',
        example: 'Email already exists.',
        type: String,
    })
    @IsString()
    message: string;

    @ApiProperty({
        description: 'Error message',
        example: 'Unprocessable Entity',
    })
    @IsString()
    error: string;
}
