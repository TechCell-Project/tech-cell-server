import { IsNotEmpty, IsString } from 'class-validator';

export class JwtRequestDto {
    @IsString()
    @IsNotEmpty()
    jwt?: string;
}
