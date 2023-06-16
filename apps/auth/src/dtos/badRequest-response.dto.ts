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
        description: 'Array of error message',
        example: [
            'password must be longer than or equal to 8 characters',
            're_password must be longer than or equal to 8 characters',
            're_password must be a string',
        ],
        type: [String],
    })
    @IsString()
    message: string[];
}
