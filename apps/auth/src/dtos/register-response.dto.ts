import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDTO {
    @ApiProperty({
        description: 'The message',
        example: 'You have been registered',
    })
    @IsString()
    message: string;
}
