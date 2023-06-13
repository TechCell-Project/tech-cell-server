import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BadRequestResponseDTO {
    @ApiProperty({
        description: 'Number of status code',
        example: 400,
    })
    @IsNumber()
    statusCode: number;

    @ApiProperty({
        description: 'Message of error',
        example: 'Bad Request',
    })
    @IsString()
    error: string;

    @ApiProperty({
        description: 'Array or string of error message',
        example: ['data must be a string', 'data must be longer than or equal to 8 characters'],
        type: [String],
    })
    @IsString()
    message: string[];
}
